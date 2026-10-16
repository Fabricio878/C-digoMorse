const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const retos = [
    { morse: ".... --- .-.. .-", respuesta: "hola" },
    { morse: "... --- ...", respuesta: "sos" },
    { morse: "-.-. .-.. .- ...- .", respuesta: "clave" },
    { morse: "..-. ..- .--. --. ---", respuesta: "fuego" },
    { morse: "-- --- .-. ... .", respuesta: "morse" }
];

let grupos = {};

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    socket.on('registrar-grupo', (nombre) => {
        grupos[socket.id] = {
            nombre: nombre,
            progreso: 0,
            completado: false
        };
        io.emit('actualizar-ranking', grupos);
    });

    socket.on('enviar-respuesta', (data) => {
        const grupo = grupos[socket.id];
        if (!grupo || grupo.completado) return;

        const retoActual = retos[grupo.progreso];
        const respuestaLimpia = data.respuesta.trim().toLowerCase();

        if (respuestaLimpia === retoActual.respuesta) {
            grupo.progreso += 1;
            if (grupo.progreso >= retos.length) {
                grupo.completado = true;
            }
            socket.emit('resultado-respuesta', { correcto: true, siguienteNivel: grupo.progreso });
            io.emit('actualizar-ranking', grupos);
        } else {
            socket.emit('resultado-respuesta', { correcto: false });
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
        delete grupos[socket.id];
        io.emit('actualizar-ranking', grupos);
    });
});

server.localPort = 3000;
server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});