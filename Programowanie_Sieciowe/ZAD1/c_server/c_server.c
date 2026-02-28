#include <err.h>
#include <netdb.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <sys/types.h>
#include <time.h>
#include <unistd.h>
#include <arpa/inet.h>

#define BUF_SIZE 65535

char response_NO[] = "INVALID";
char response_OK[] = "VALID";

void print_message(char buf[], int nread)
{
    int i;
    for (i = 2; i < nread; i += 3)
    {
        char character = buf[i];
        u_int16_t number = ((unsigned char)buf[i + 1] << 8) | (unsigned char)buf[i + 2];
        printf("Pair number %d Character: %c, Number: %d\n", ((i - 2) / 3) + 1, character, number);
    }
}
void parse_args(int argc, char *argv[], int *print, struct sockaddr_in *server)
{
    if (argc > 5)
    {
        fprintf(stderr, "invalid argument number\n");
        exit(1);
    }
    else if (argc < 2)
    {
        server->sin_port = htons(8000); // default port
        *print = 1;
        server->sin_addr.s_addr = inet_addr("0.0.0.0");
    }
    else if (argc == 2)
    {
        server->sin_port = htons(atoi(argv[1]));
        *print = 1;
        server->sin_addr.s_addr = inet_addr("0.0.0.0");
    }
    else if (argc == 3)
    {
        server->sin_port = htons(atoi(argv[1]));
        *print = atoi(argv[2]);
        server->sin_addr.s_addr = inet_addr("0.0.0.0");
    }
    else if (argc == 4)
    {
        server->sin_port = htons(atoi(argv[1]));
        *print = atoi(argv[2]);
        server->sin_addr.s_addr = inet_addr(argv[3]);
    }
}

void send_response(int sock, struct sockaddr_storage *peer_addr, socklen_t peer_addrlen, char *response, char *host, char *service)
{
    printf("Sending response to %s:%s\n", host, service);
    int nsent = sendto(sock, response, strlen(response), 0,
                       (struct sockaddr *)peer_addr, peer_addrlen);
    if (nsent < 0)
    {
        fprintf(stderr, "failed sendto\n");
    }
}

void validate_message(char buf[], ssize_t nread, char **response, int print, char *host, char *service)
{
    if (nread < 2)
    {
        fprintf(stdout, "Packet too small: received %zd bytes, expected at least 2 bytes\n", nread);
        *response = response_NO;
        return;
    }
    printf("Received %zd bytes from %s:%s\n", nread, host, service);
    u_int16_t expected_length = ((unsigned char)buf[0] << 8) | (unsigned char)buf[1];
    expected_length = expected_length * 3; // multiply multiplier 3 because each packet contains 3 bytes of data (char + u_int16_t)
    expected_length += 2;                  // add 2 bytes of header
    if (nread != expected_length)
    {
        fprintf(stdout, "Unexpected packet size: received %zd bytes, expected %d bytes\n", nread, expected_length);
        *response = response_NO;
    }
    else
    {
        fprintf(stdout, "Correct message received\n");
        if (print)
        {
            print_message(buf, nread);
        }
        *response = response_OK;
    }
}

int main(int argc, char *argv[])
{
    int sfd, s;
    char buf[BUF_SIZE];
    ssize_t nread;
    socklen_t peer_addrlen;
    struct sockaddr_in server;
    struct sockaddr_storage peer_addr;
    char *response;
    int print = 0;
    char *addr = "0.0.0.0";
    if ((sfd = socket(AF_INET, SOCK_DGRAM, 0)) < 0)
    {
        fprintf(stderr, "socket() returned error\n");
        exit(1);
    }
    parse_args(argc, argv, &print, &server);
    server.sin_family = AF_INET;
    if ((s = bind(sfd, (struct sockaddr *)&server, sizeof(server))) < 0)
    {
        fprintf(stderr, "bind()  returned error\n");
        exit(1);
    }
    printf("bind() successful\n");
    printf("server started awaiting connections\n");
    // Because this is a continuous server and we are supposed to stop only by killing the process, I use an infinite loop here
    while (1)
    {
        char host[NI_MAXHOST], service[NI_MAXSERV];
        peer_addrlen = sizeof(peer_addr);
        nread = recvfrom(sfd, buf, BUF_SIZE, 0,
                         (struct sockaddr *)&peer_addr, &peer_addrlen);
        if (nread < 0)
        {
            fprintf(stderr, "failed recvfrom\n");
        }
        else
        {
            fprintf(stdout, "recvfrom ok\n");
            int s = getnameinfo((struct sockaddr *)&peer_addr, peer_addrlen,
                                host, NI_MAXHOST,
                                service, NI_MAXSERV,
                                NI_NUMERICHOST | NI_NUMERICSERV);
            if (s == 0)
            {
                validate_message(buf, nread, &response, print, host, service);
            }
            else
            {
                fprintf(stderr, "getnameinfo() error \n");
            }
            send_response(sfd, &peer_addr, peer_addrlen, response, host, service);
        }
    }
}