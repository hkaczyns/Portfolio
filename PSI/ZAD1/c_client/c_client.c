#include "c_client.h"
#include <arpa/inet.h>
#include <err.h>
#include <netdb.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <sys/types.h>
#include <unistd.h>

#define bailout(s) { perror(s); close(sock); exit(1); }
#define Usage() { errx(0, "Usage: %s <host> <port> <dgram_count> <delay-in-ms> <no_fragment> [len1 len2 ...]\n", argv[0]); }

void generate_datagram(char *databuf, uint16_t length)
{
    if (length < 3)
    {
        return;
    }

    uint16_t pairs_len = length - 2;
    uint16_t pairs_num = pairs_len / 3;

    databuf[0] = (pairs_num >> 8) & 0xFF;
    databuf[1] = pairs_num & 0xFF;

    uint16_t i;
    for (i = 0; i < pairs_num; i++)
    {
        databuf[2 + 3 * i] = 'A' + (i % 26);
        databuf[2 + 3 * i + 1] = (i >> 8) & 0xFF;
        databuf[2 + 3 * i + 2] = i & 0xFF;
    }
}

void print_address(const char *s, struct sockaddr *address, socklen_t addrlen)
{
    char addrbuffer[NI_MAXHOST];
    getnameinfo(address, addrlen, addrbuffer, NI_MAXHOST, 0, 0, NI_NUMERICHOST);
    printf("%s %s\n", s, addrbuffer);
}

int main(int argc, char *argv[])
{
    int sock;
    struct sockaddr_in server;
    struct hostent *hp;

    char databuf[DGRAMSIZE];
    long int dgram_count, delay_ms;
    long int i;
    int no_fragment;

    if (argc < 7) {
        Usage();
    }

    dgram_count = atol(argv[3]);
    delay_ms = atol(argv[4]) * 1000; // conversion to microseconds
    no_fragment = atoi(argv[5]);

    // Datagram lengths list parsing
    int custom_len_count = argc - 6;
    int *custom_lengths_list = NULL;

    custom_lengths_list = malloc(sizeof(int) * custom_len_count);
    if (!custom_lengths_list)
    {
        errx(1, "Memory allocation failed");
    }

    int j;
    for (j = 0; j < custom_len_count; j++) {
        custom_lengths_list[j] = atoi(argv[6 + j]);
    }

    // Socket connection
    sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (sock < 0)
    {
        bailout("Opening UDP socket failed");
    }

    if (no_fragment == 1) {
        int val = IP_PMTUDISC_DO;
        if (setsockopt(sock, IPPROTO_IP, IP_MTU_DISCOVER, &val, sizeof(val)) < 0) {
            bailout("setsockopt IP_MTU_DISCOVER failed");
        }
        printf("IP Fragmentation disabled\n");
    } else {
        printf("IP Fragmentation enabled\n");
    }

    server.sin_family = AF_INET;
    hp = gethostbyname2(argv[1], AF_INET);
    if (!hp)
    {
        errx(2, "%s: Unknown host\n", argv[1]);
    }

    memcpy(&server.sin_addr, hp->h_addr, hp->h_length);
    server.sin_port = htons(atoi(argv[2]));

    if (connect(sock, (struct sockaddr *)&server, sizeof(server)) < 0)
    {
        bailout("connect");
    }

    print_address("Sending packets to:", (struct sockaddr *)&server, sizeof(server));

    for (i = 0; i < dgram_count; i++)
    {

        // Choosing datagram length
        int dgram_len;
        if (custom_len_count > 1)
        {
            dgram_len = custom_lengths_list[i % custom_len_count];
        }
        else
        {
            dgram_len = custom_lengths_list[0];
        }

        if (dgram_len > DGRAMSIZE)
        {
            printf("   Datagram #%ld not sent: requested length %d exceeds maximum of %d\n",
                   i, dgram_len, DGRAMSIZE);
            continue;
        }

        if (dgram_len % 3 != 2)
        {
            printf("   Datagram #%ld not sent: length %d does not satisfy 'len %% 3 == 2'\n",
                   i, dgram_len);
            continue;
        }

        memset(databuf, 0, DGRAMSIZE);
        generate_datagram(databuf, dgram_len);

        printf("   Sending datagram #%ld (size=%d)\n", i, dgram_len);

        if (send(sock, databuf, dgram_len, 0) < 0)
        {
            perror("send error");
        }

        // Waiting for server response
        {
            char recvbuf[64];
            ssize_t r;

            // Timeout for receiving: 1 second
            struct timeval tv;
            tv.tv_sec = 1;
            tv.tv_usec = 0;
            if (setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv)) < 0)
            {
                bailout("setsockopt failed");
            }

            r = recv(sock, recvbuf, sizeof(recvbuf) - 1, 0);
            if (r < 0)
            {
                perror("recv");
                printf("   (No response from server)\n");
            }
            else
            {
                if (strcmp(recvbuf, "VALID") == 0)
                {
                    printf("   Server response: VALID\n");
                }
                else if (strcmp(recvbuf, "INVALID") == 0)
                {
                    printf("   Server response: INVALID\n");
                }
                else
                {
                    printf("   Server answered: %s\n", recvbuf);
                }
            }
        }
        usleep(delay_ms);
    }

    close(sock);
    free(custom_lengths_list);
    return 0;
}
