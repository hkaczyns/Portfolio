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
#include <stdbool.h>

#define BUF_SIZE 6000
#define ACK_RETRANSMISION 1

void print_message(char buf[], int nread)
{
  int i;
  for (i = 3; i < nread; i += 3)
  {
    char character = buf[i];
    u_int16_t number = ((unsigned char)buf[i + 1] << 8) | (unsigned char)buf[i + 2];
    printf("Pair number %d Character: %c, Number: %d\n", ((i - 3) / 3) + 1, character, number);
  }
}

void paree_arguments(int argc, char *argv[], struct sockaddr_in6 *server, int *print)
{
  if (argc >= 4)
  {
    perror("invalid argument number");
    exit(1);
  }
  else if (argc < 2)
  {
    server->sin6_port = htons(8000); // default port
  }
  else
  {
    server->sin6_port = htons(atoi(argv[1]));
    *print = atoi(argv[2]);
  }
}

void read_message(char buf[], int nread, int sock, struct sockaddr_storage peer_addr,
                  socklen_t peer_addrlen, char *response_NO,
                  char *response_OK_1, char *response_OK_0,
                  int *awaited_packet, char *response,
                  bool *first_ack, time_t *prev_resp, int print, char host[], char service[])
{
  nread = recvfrom(sock, buf, BUF_SIZE, 0,
                   (struct sockaddr *)&peer_addr, &peer_addrlen);
  if (nread < 0)
  {
    fprintf(stderr, "failed recvfrom\n");
  }
  else
  {
    int s = getnameinfo((struct sockaddr *)&peer_addr, peer_addrlen,
                        host, NI_MAXHOST,
                        service, NI_MAXSERV,
                        NI_NUMERICHOST | NI_NUMERICSERV);
    if (s == 0)
    {
      printf("Received %zd bytes from %s:%s\n", nread, host, service);
      u_int16_t expected_length = ((unsigned char)buf[1] << 8) | (unsigned char)buf[2];
      u_int8_t packet_number = (unsigned char)buf[0];

      if (packet_number == *awaited_packet)
      {
        printf("Expected packet number received: %d\n", packet_number);
        expected_length = expected_length * 3; // multiplier 3 because each packet contains 3 bytes of data (char + u_int16_t)
        expected_length += 3;                  // add 3 bytes of header
        if (nread == expected_length)
        {
          fprintf(stdout, "Correct message received\n");
          if (print)
          {
            print_message(buf, nread);
          }
          if (awaited_packet == 0)
            response = response_OK_0;
          else
            response = response_OK_1;
          *awaited_packet = 1 - *awaited_packet;
        }
        else
        {
          fprintf(stdout, "Unexpected packet size: received %zd bytes, expected %d bytes\n", nread, expected_length);
          response = response_NO;
        }
      }
      else
      {
        fprintf(stdout, "Received duplicate packet (seq=%d, expected=%d)\n", packet_number, awaited_packet);
      }
      send_response(sock, peer_addr, peer_addrlen, response, host, service);
      *first_ack = true;
      *prev_resp = time(NULL);
    }
    else
    {
      fprintf(stderr, "getnameinfo() error \n");
    }
  }
}

void send_response(int sock, struct sockaddr_storage peer_addr,
                   socklen_t peer_addrlen, char *response, char host[], char service[])
{
  printf("Retransmitting %s response to %s:%s\n", response, host, service);
  int nsent = sendto(sock, response, strlen(response), 0,
                     (struct sockaddr *)&peer_addr, peer_addrlen);
  if (nsent < 0)
  {
    fprintf(stderr, "failed sendto\n");
  }
}
int main(int argc, char *argv[])
{
  int awaited_packet = 0;
  int sock, s;
  char buf[BUF_SIZE];
  ssize_t nread;
  socklen_t peer_addrlen;
  struct sockaddr_in6 server;
  struct sockaddr_storage peer_addr;
  char response_NO[] = "INVALID";
  char response_OK_1[] = "ACK1";
  char response_OK_0[] = "ACK0";
  char *response = response_OK_0;
  bool first_ack = false;
  struct timeval timeout = {1, 0};
  int select_status;
  time_t prev_resp = time(NULL);
  int count = 0;
  int print = 0;

  if ((sock = socket(AF_INET6, SOCK_DGRAM, 0)) < 0)
  {
    perror("socker() returned error");
    exit(1);
  }
  paree_arguments(argc, argv, &server, &print);
  server.sin6_family = AF_INET6;
  server.sin6_addr = in6addr_any;
  if ((s = bind(sock, (struct sockaddr *)&server, sizeof(server))) < 0)
  {
    perror("bind()  returned error");
    exit(s);
  }
  printf("bind() successful\n");
  printf("server started awaiting connections\n");
  // since this is a continuous server and we are supposed to stop only by killing the process, I use an infinite loop here
  while (1)
  {
    fd_set readfds;
    FD_ZERO(&readfds);
    FD_SET(sock, &readfds);
    timeout.tv_sec = 10;
    timeout.tv_usec = 0;
    char host[NI_MAXHOST], service[NI_MAXSERV];
    peer_addrlen = sizeof(peer_addr);
    select_status = select(sock + 1, &readfds, NULL, NULL, &timeout);
    if (select_status < 0)
    {
      fprintf(stderr, "failed select\n");
    }
    else
    {
      if (FD_ISSET(sock, &readfds))
      {
        read_message(buf, nread, sock, peer_addr, peer_addrlen,
                     response_NO, response_OK_1, response_OK_0,
                     &awaited_packet, response,
                     &first_ack, &prev_resp, print, host, service);
      }
      if (time(NULL) - prev_resp >= ACK_RETRANSMISION && first_ack)
      {
        send_response(sock, peer_addr, peer_addrlen, response, host, service);
        prev_resp = time(NULL);
      }
    }
  }
}