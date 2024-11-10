const { google } = require('googleapis');
const readline = require('readline');

// Configura el cliente OAuth2 con tus credenciales
const oauth2Client = new google.auth.OAuth2(
  '502530816558-cpn6rhnjcfb4tm2mnd8r25uuub143q5u.apps.googleusercontent.com',          
  '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',      
  'http://localhost:3000'
);

// Define los scopes (permisos) que necesita tu aplicación
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

// Genera una URL para autorizar la aplicación
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Importante: 'offline' asegura que se genere un Refresh Token
  scope: SCOPES,
});

console.log('Autoriza esta aplicación visitando la siguiente URL:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Solicita el código de autorización obtenido después de la autorización
rl.question('Introduce el código que aparece después de la autorización: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('Error al obtener el token de acceso:', err);
      return;
    }

    // Muestra los tokens obtenidos
    console.log('Token obtenido:', token);

    // Extrae el Refresh Token y guárdalo de manera segura
    console.log('Refresh Token:', token.refresh_token);
  });
});
