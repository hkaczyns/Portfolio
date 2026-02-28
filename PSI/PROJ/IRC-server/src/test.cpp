#include <gtest/gtest.h>
#include <libircclient.h>
#include <atomic>
#include <thread>
#include <chrono>
#include <cstring>
#include <mutex>
#include <vector>
#include <string>

std::mutex response_mutex;
std::vector<std::string> responses;

void print_responses()
{
    std::lock_guard<std::mutex> lock(response_mutex);
    for (const auto &r : responses)
        std::cout << "Response: " << r << std::endl;
}

void store_response(const std::string &msg)
{
    std::lock_guard<std::mutex> lock(response_mutex);
    responses.push_back(msg);
}

void event_numeric(irc_session_t *session, unsigned int event, const char *origin, const char **params, unsigned int count)
{
    std::ostringstream oss;
    oss << event;

    for (unsigned int i = 0; i < count; ++i)
        oss << " " << params[i];

    store_response(oss.str());
}

void event_privmsg(irc_session_t *session,
                   const char *event,
                   const char *origin,
                   const char **params,
                   unsigned int count)
{
    std::cout << std::endl
              << count << std::endl
              << origin << std::endl
              << params[0] << std::endl
              << params[1] << std::endl;
    if (count >= 2 && origin && params[0] && params[1])
    {
        std::ostringstream oss;
        oss << ":" << origin << " PRIVMSG " << params[0] << " :" << params[1];
        store_response(oss.str());
    }
    std::cout << "==================================" << std::endl;
}

bool wait_for_response(const std::string &pattern, int timeout_ms = 2000)
{
    for (int i = 0; i < timeout_ms / 50; ++i)
    {
        {
            std::lock_guard<std::mutex> lock(response_mutex);
            for (const auto &r : responses)
                if (r.find(pattern) != std::string::npos)
                    return true;
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }
    return false;
}

class IRCIntegrationTest : public ::testing::Test
{
protected:
    irc_session_t *session;
    std::thread irc_thread;

    std::string server_addr;
    unsigned int server_port;
    std::string nick;
    std::string user;
    std::string realname;

    IRCIntegrationTest(
        const std::string &server_addr_ = "127.0.0.1",
        unsigned int server_port_ = 6667,
        const std::string &nick_ = "testnick",
        const std::string &user_ = "testuser",
        const std::string &realname_ = "Test User")
        : server_addr(server_addr_), server_port(server_port_),
          nick(nick_), user(user_), realname(realname_)
    {
    }

    void SetUp() override
    {
        responses.clear();

        irc_callbacks_t cb{};
        cb.event_numeric = event_numeric;
        cb.event_privmsg = event_privmsg;
        cb.event_channel = event_privmsg;

        session = irc_create_session(&cb);
        ASSERT_NE(session, nullptr);

        ASSERT_EQ(
            irc_connect(
                session,
                server_addr.c_str(),
                server_port,
                "123456",
                nick.c_str(),
                user.c_str(),
                realname.c_str()),
            0);

        irc_thread = std::thread([&]()
                                 { irc_run(session); });

        ASSERT_TRUE(wait_for_response("1 testnick Welcome to the IRC Network testnick!testuser@localhost"));
        ASSERT_TRUE(wait_for_response("2 testnick Your host is myircserver.local, running version 0.1"));
        ASSERT_TRUE(wait_for_response("3 testnick This server was created just now"));
        ASSERT_TRUE(wait_for_response("4 testnick myircserver.local 0.1 o o"));
        ASSERT_TRUE(wait_for_response("375 testnick - myircserver.local Message of the day -"));
        ASSERT_TRUE(wait_for_response("372 testnick - Welcome to the our Z51 IRC server!"));
        ASSERT_TRUE(wait_for_response("376 testnick End of /MOTD command."));
    }

    void TearDown() override
    {
        irc_disconnect(session);
        irc_thread.join();
    }
};

TEST_F(IRCIntegrationTest, UNKNOWNCOMMAND)
{
    irc_send_raw(session, "FakeCommand");

    EXPECT_TRUE(wait_for_response("421 testnick FAKECOMMAND Unknown command"));

    print_responses();
}

TEST_F(IRCIntegrationTest, NICKNONICKNAMEGIVEN)
{
    irc_send_raw(session, "NICK");

    EXPECT_TRUE(wait_for_response("431 * No nickname given"));

    print_responses();
}

TEST_F(IRCIntegrationTest, NICKERRONEUSNICKNAME)
{
    irc_send_raw(session, "NICK Invalid!Nick");

    EXPECT_TRUE(wait_for_response("432 * Invalid!Nick Nickname is invalid"));

    print_responses();
}

TEST_F(IRCIntegrationTest, NICKNICKNAMEINUSEByOthers)
{
    irc_send_raw(session, "NICK TakenNick");

    irc_session_t *session2;
    irc_callbacks_t cb2{};
    cb2.event_numeric = event_numeric;

    session2 = irc_create_session(&cb2);
    ASSERT_NE(session2, nullptr);

    ASSERT_EQ(
        irc_connect(session2, "127.0.0.1", 6667, "123456", "othernick", "user2", "Other User"),
        0);

    std::thread thread2([&]()
                        { irc_run(session2); });

    std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    irc_send_raw(session2, "NICK TakenNick");

    EXPECT_TRUE(wait_for_response("433 * TakenNick Nickname is already in use"));

    print_responses();

    irc_disconnect(session2);
    thread2.join();
}

TEST_F(IRCIntegrationTest, USERALREADYREGISTREDInvalidUsername)
{
    irc_session_t *session2;
    irc_callbacks_t cb2{};
    cb2.event_numeric = event_numeric;

    session2 = irc_create_session(&cb2);
    ASSERT_NE(session2, nullptr);

    ASSERT_EQ(
        irc_connect(session2, "127.0.0.1", 6667, "123456", "othernick", "!!!testuser", "Other User"),
        0);

    std::thread thread2([&]()
                        { irc_run(session2); });

    std::this_thread::sleep_for(std::chrono::milliseconds(1000));

    EXPECT_TRUE(wait_for_response("462 * USER Invalid username"));

    print_responses();

    irc_disconnect(session2);
    thread2.join();
}

TEST_F(IRCIntegrationTest, USERNEEDMOREPARAMS)
{
    irc_send_raw(session, "USER");

    EXPECT_TRUE(wait_for_response("461 * USER Not enough parameters"));

    print_responses();
}

TEST_F(IRCIntegrationTest, USERALREADYREGISTREDAfterRegistration)
{
    irc_send_raw(session, "USER NewUser 127.0.0.1/6667 myircserver.local NewRealName");

    EXPECT_TRUE(wait_for_response("462 testnick You may not reregister"));

    print_responses();
}

TEST_F(IRCIntegrationTest, USERALREADYREGISTREDOthersUsername)
{
    irc_session_t *session2;
    irc_callbacks_t cb2{};
    cb2.event_numeric = event_numeric;

    session2 = irc_create_session(&cb2);
    ASSERT_NE(session2, nullptr);

    ASSERT_EQ(
        irc_connect(session2, "127.0.0.1", 6667, "123456", "othernick", "testuser", "Other User"),
        0);

    std::thread thread2([&]()
                        { irc_run(session2); });

    std::this_thread::sleep_for(std::chrono::milliseconds(1000));

    EXPECT_TRUE(wait_for_response("462 * testuser Username is already in use"));

    print_responses();

    irc_disconnect(session2);
    thread2.join();
}

TEST_F(IRCIntegrationTest, PRIVMSGNOSUCHNICK)
{
    irc_send_raw(session, "PRIVMSG NonExistentNick :Hello there!");

    EXPECT_TRUE(wait_for_response("401 testnick NonExistentNick No such nick/channel"));

    print_responses();
}

TEST_F(IRCIntegrationTest, PRIVMSGNOTEXTTOSEND)
{
    irc_send_raw(session, "PRIVMSG testnick");

    EXPECT_TRUE(wait_for_response("412 testnick No text to send"));

    print_responses();
}

TEST_F(IRCIntegrationTest, PRIVMSGTOOMANYTARGETS)
{
    irc_send_raw(session, "PRIVMSG testnick testnick2 :Hello there!");

    EXPECT_TRUE(wait_for_response("407 testnick Too many targets"));

    print_responses();
}

TEST_F(IRCIntegrationTest, PRIVMSGNORECIPIENT)
{
    irc_send_raw(session, "PRIVMSG");

    EXPECT_TRUE(wait_for_response("411 testnick No recipient given (PRIVMSG)"));

    print_responses();
}

TEST_F(IRCIntegrationTest, PRIVMSGCorrect)
{
    irc_session_t *session2;
    irc_callbacks_t cb2{};
    cb2.event_numeric = event_numeric;

    session2 = irc_create_session(&cb2);
    ASSERT_NE(session2, nullptr);

    ASSERT_EQ(
        irc_connect(session2, "127.0.0.1", 6667, "123456", "othernick", "otheruser", "Other User"),
        0);

    std::thread thread2([&]()
                        { irc_run(session2); });

    std::this_thread::sleep_for(std::chrono::milliseconds(1000));

    irc_send_raw(session2, "PRIVMSG testnick :Hello there!");

    EXPECT_TRUE(wait_for_response(":othernick!otheruser@localhost PRIVMSG testnick :Hello there!"));

    print_responses();

    irc_disconnect(session2);
    thread2.join();
}

TEST_F(IRCIntegrationTest, JOINCorrect)
{
    irc_send_raw(session, "JOIN #testchannel");

    irc_session_t *session2;
    irc_callbacks_t cb2{};
    cb2.event_numeric = event_numeric;

    session2 = irc_create_session(&cb2);
    ASSERT_NE(session2, nullptr);

    ASSERT_EQ(
        irc_connect(session2, "127.0.0.1", 6667, "123456", "othernick", "otheruser", "Other User"),
        0);

    std::thread thread2([&]()
                        { irc_run(session2); });

    std::this_thread::sleep_for(std::chrono::milliseconds(1000));

    irc_send_raw(session2, "JOIN #testchannel");

    irc_send_raw(session2, "PRIVMSG #testchannel :Hello there!");
    irc_send_raw(session, "PRIVMSG #testchannel :Hi there!");

    std::this_thread::sleep_for(std::chrono::milliseconds(1000));

    EXPECT_TRUE(wait_for_response("331 testnick #testchannel No topic is set"));
    EXPECT_TRUE(wait_for_response("353 testnick = #testchannel @testnick"));
    EXPECT_TRUE(wait_for_response("366 testnick #testchannel End of NAMES list"));

    std::this_thread::sleep_for(std::chrono::milliseconds(1000));

    irc_send_raw(session2, "PART #testchannel");
    irc_send_raw(session, "PART #testchannel");
    print_responses();
    std::this_thread::sleep_for(std::chrono::milliseconds(1000));

    irc_disconnect(session2);
    thread2.join();
}

TEST_F(IRCIntegrationTest, WHOCommandCorrect)
{
    irc_send_raw(session, "WHO");

    EXPECT_TRUE(wait_for_response("testnick * testuser localhost myircserver.local testnick H 0 Test User"));
    EXPECT_TRUE(wait_for_response("315 testnick * End of WHO list"));

    print_responses();
}

TEST_F(IRCIntegrationTest, WHOCommandZeroListsAll)
{
    irc_send_raw(session, "WHO 0");

    EXPECT_TRUE(wait_for_response("352 testnick * testuser localhost myircserver.local testnick H 0 Test User"));
    EXPECT_TRUE(wait_for_response("315 testnick 0 End of WHO list"));

    print_responses();
}

TEST_F(IRCIntegrationTest, WHOCommandWildcardFiltersUsers)
{
    irc_session_t *session2;
    irc_session_t *session3;
    irc_callbacks_t cb{};
    cb.event_numeric = event_numeric;

    session2 = irc_create_session(&cb);
    ASSERT_NE(session2, nullptr);
    ASSERT_EQ(irc_connect(session2, "127.0.0.1", 6667, "123456", "othernick", "otheruser", "Other User"), 0);
    std::thread thread2([&]()
                        { irc_run(session2); });
    ASSERT_TRUE(wait_for_response("376 othernick End of /MOTD command."));

    session3 = irc_create_session(&cb);
    ASSERT_NE(session3, nullptr);
    ASSERT_EQ(irc_connect(session3, "127.0.0.1", 6667, "123456", "abcdabcd", "else", "Anything Else"), 0);
    std::thread thread3([&]()
                        { irc_run(session3); });
    ASSERT_TRUE(wait_for_response("376 abcdabcd End of /MOTD command."));

    irc_send_raw(session, "WHO *nick");

    EXPECT_TRUE(wait_for_response("352 testnick * testuser localhost myircserver.local testnick H 0 Test User"));
    EXPECT_TRUE(wait_for_response("352 testnick * otheruser localhost myircserver.local othernick H 0 Other User"));
    EXPECT_TRUE(wait_for_response("315 testnick *nick End of WHO list"));
    EXPECT_FALSE(wait_for_response("352 testnick * else localhost myircserver.local abcdabcd H 0 Anything Else", 300));

    irc_disconnect(session2);
    thread2.join();
    irc_disconnect(session3);
    thread3.join();

    print_responses();
}

TEST_F(IRCIntegrationTest, WHOCommandExactNickReturnsSingleUser)
{
    irc_session_t *session2;
    irc_session_t *session3;
    irc_callbacks_t cb{};
    cb.event_numeric = event_numeric;

    session2 = irc_create_session(&cb);
    ASSERT_NE(session2, nullptr);
    ASSERT_EQ(irc_connect(session2, "127.0.0.1", 6667, "123456", "othernick", "otheruser", "Other User"), 0);
    std::thread thread2([&]()
                        { irc_run(session2); });
    ASSERT_TRUE(wait_for_response("376 othernick End of /MOTD command."));

    session3 = irc_create_session(&cb);
    ASSERT_NE(session3, nullptr);
    ASSERT_EQ(irc_connect(session3, "127.0.0.1", 6667, "123456", "abcdabcd", "else", "Anything Else"), 0);
    std::thread thread3([&]()
                        { irc_run(session3); });
    ASSERT_TRUE(wait_for_response("376 abcdabcd End of /MOTD command."));

    irc_send_raw(session, "WHO othernick");

    EXPECT_TRUE(wait_for_response("352 testnick * otheruser localhost myircserver.local othernick H 0 Other User"));
    EXPECT_TRUE(wait_for_response("315 testnick othernick End of WHO list"));
    EXPECT_FALSE(wait_for_response("352 testnick * else localhost myircserver.local abcdabcd H 0 Anything Else", 300));
    irc_disconnect(session2);
    thread2.join();
    irc_disconnect(session3);
    thread3.join();

    print_responses();
}