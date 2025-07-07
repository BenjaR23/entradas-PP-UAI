import { backendURL } from '../../config.js';
import { useEffect, useState } from 'react';
// Establecemos una interfaz para definir los atributos del usuario que vamos a manejar
// Esta interfaz define los campos que esperamos recibir del token JWT una vez que sea verificado
interface UserAttributes {
    usermail: string;
    userID: number;
    userName: string;
    userRole: string;
    userRUN: string;
  }


// Creamos un hook personalizado que se encargará de verificar el token JWT y devolver los atributos del usuario
// El proposito de este siendo que se pueda usar en cualquier componente de React para obtener los datos del usuario autenticado sin tener que repetir la lógica de verificación del token en cada componente.
// Este hook recibe un contexto (ctx) que contiene el token JWT y devuelve los atributos del usuario si el token es válido, o null si no lo es.
function useJWTBoilerplate(ctx: string): UserAttributes | null {
    const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(null); // Inicializamos el estado de los atributos del usuario como null

    useEffect(() => {
        const verifyToken = async () => { // Definimos una función asíncrona para verificar el token JWT
            if (ctx) {
                try {
                    const response = await fetch(`${backendURL}/verify`, { // Realizamos una solicitud POST al endpoint de verificación del token
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: ctx }), // Enviamos el token en el cuerpo de la solicitud
                    });
                    const tokendata = await response.json(); // Convertimos la respuesta a JSON para obtener los datos del token
                    if (tokendata.status === 'success') { // Si la verificación del token fue exitosa, actualizamos el estado con los atributos del usuario
                    setUserAttributes({
                        usermail: tokendata.items.userEmail,
                        userID: tokendata.items.userId,
                        userName: tokendata.items.userName,
                        userRole: tokendata.items.userRole,
                        userRUN: tokendata.items.userRUN
                    });
                }
                } catch (error) {
                    console.error('Token verification failed:', error); // Si ocurre un error durante la verificación del token, lo registramos en la consola
                }
            }
        };

        verifyToken(); // Llamamos a la función de verificación del token cuando el componente se monta o cuando el contexto cambia

    }, [ctx]);

    return userAttributes; // Devolvemos los atributos del usuario si el token es valido y null si no
}


export default useJWTBoilerplate;