#define _WIN32_WINNT 0x0601
#include <winsock2.h>
#include <mswsock.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <stdio.h>

#pragma comment(lib, "Ws2_32.lib")

#define CONNECTIONS 2000
#define REQUESTS_PER_CONN 50

char request[] =
    "GET / HTTP/1.1\r\n"
    "Host: https://moncollege-valdoise.fr\r\n"
    "Connection: keep-alive\r\n\r\n";

typedef struct {
    SOCKET s;
    WSAOVERLAPPED overlapped;
    WSABUF buffer;
    char data[8192];
} CONNECTION;

CONNECTION conns[CONNECTIONS];
HANDLE iocp;

void start_pipeline(CONNECTION* c);

void CALLBACK on_recv(DWORD err, DWORD bytes, LPWSAOVERLAPPED ov, DWORD flags) {
    CONNECTION* c = (CONNECTION*)ov;

    // Ignorer la réponse et renvoyer immédiatement les requêtes suivantes
    start_pipeline(c);
}

void start_pipeline(CONNECTION* c) {
    DWORD sent;

    for (int i = 0; i < REQUESTS_PER_CONN; i++) {
        WSASend(c->s, &(WSABUF){ strlen(request), request }, 1, &sent, 0, &c->overlapped, NULL);
    }

    // Recevoir sans limite
    DWORD flags = 0;
    WSARecv(c->s, &c->buffer, 1, NULL, &flags, &c->overlapped, on_recv);
}

int main() {
    WSADATA wsa;
    WSAStartup(MAKEWORD(2,2), &wsa);

    iocp = CreateIoCompletionPort(INVALID_HANDLE_VALUE, NULL, 0, 0);

    printf("Starting HTTP pipelining load test with %d persistent connections...\n", CONNECTIONS);

    for (int i = 0; i < CONNECTIONS; i++) {
        SOCKET s = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);

        struct sockaddr_in addr = { 0 };
        addr.sin_family = AF_INET;
        addr.sin_port = htons(3000);
        inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);

        connect(s, (struct sockaddr*)&addr, sizeof(addr));

        CreateIoCompletionPort((HANDLE)s, iocp, 0, 0);

        conns[i].s = s;
        memset(&conns[i].overlapped, 0, sizeof(WSAOVERLAPPED));
        conns[i].buffer.buf = conns[i].data;
        conns[i].buffer.len = sizeof(conns[i].data);

        start_pipeline(&conns[i]);
    }

    // IOCP loop (never returns)
    while (1) {
        DWORD bytes = 0;
        ULONG_PTR key = 0;
        LPOVERLAPPED ov = NULL;

        GetQueuedCompletionStatus(iocp, &bytes, &key, &ov, INFINITE);
    }

    WSACleanup();
    return 0;
}