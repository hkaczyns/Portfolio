#include <arpa/inet.h>
#include <err.h>
#include <netdb.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>
#include <stdint.h>

#define TEXT_SIZE 64

#define bailout(s) { perror(s); exit(1); }
#define Usage() { errx(0, "Usage: %s [address-or-ip] [port] [number-of-nodes]\n", argv[0]); }

// One-way list element
typedef struct Node {
    int16_t val16;
    int32_t val32;
    char text[TEXT_SIZE];
    struct Node *next;
} Node;

// Element to be sent over the network
typedef struct __attribute__((packed)) NetworkNode {
    int16_t val16;
    int32_t val32;
    char text[TEXT_SIZE];
} NetworkNode;

Node* create_node(int16_t val16, int32_t val32, const char *text) {
    Node *node = (Node*)malloc(sizeof(Node));
    if (!node) bailout("malloc");

    node->val16 = val16;
    node->val32 = val32;

    size_t text_len = strlen(text);
    if (text_len <= TEXT_SIZE) {
        memcpy(node->text, text, text_len + 1);
    } else {
        bailout("text too long");
    }
    node->next = NULL;
    return node;
}

void send_list(int sock, Node *head) {
    Node *current = head;
    int count = 0;

    printf("\nSending data...\n");
    printf("NetworkNode size: %zu bytes\n\n", sizeof(NetworkNode));

    while (current != NULL) {
        NetworkNode net_node;
        net_node.val16 = htons(current->val16); // host-to-network-short
        net_node.val32 = htonl(current->val32); // host-to-network-long
        memcpy(net_node.text, current->text, TEXT_SIZE);

        ssize_t sent = write(sock, &net_node, sizeof(NetworkNode));
        if (sent == -1) {
            bailout("writing on stream socket");
        }

        count++;
        printf("I've just sent a node %d: val16=%d, val32=%d, text=\"%s\"\n", count, current->val16, current->val32, current->text);
        current = current->next;
    }

    printf("\nTotal nodes sent: %d\n", count);
}

void free_list(Node *head) {
    Node *current = head;
    while (current != NULL) {
        Node *temp = current;
        current = current->next;
        free(temp);
    }
}

int main(int argc, char *argv[]) {
    int sock = 0;
    struct sockaddr_in server_addr;
    
    if (argc != 4) Usage();

    Node *head = create_node(1, 21, "Head node");
    if (atoi(argv[3]) <= 1) {
        bailout("Number of nodes must be greater than 1!");
    }

    const char *node_titles[] = {"Next node", "Node again", "Another node", "Yet another node"};
    int titles_count = sizeof(node_titles) / sizeof(node_titles[0]);

    Node *current = head;
    
    int i;
    for (i = 1; i < atoi(argv[3]); i++)
    {
        Node *new_node = create_node(i + 1, (i + 1) * 21, node_titles[i % titles_count]);
        current->next = new_node;
        current = current->next;
        
    }

    server_addr.sin_port = htons(atoi(argv[2]));
    server_addr.sin_family = AF_INET;

    struct hostent *server = gethostbyname(argv[1]);
    if (server == NULL) {
        bailout("gethostbyname");
    }

    memcpy(&server_addr.sin_addr.s_addr, server->h_addr, server->h_length);

    sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == -1) {
        bailout("error opening stream socket");
    }

    printf("Connecting to server\n");

    if (connect(sock, (struct sockaddr *)&server_addr, sizeof(server_addr)) == -1) {
        bailout("connecting stream socket");
    }
    printf("Connected.\n");

    send_list(sock, head);
    close(sock);
    printf("Connection closed.\n");

    free_list(head);
    exit(0);
}