import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useJWTBoilerplate from '../backend-node/client.ts'; // Importar userJWTBoilerplate para verificar el token de usuario
import Loader from '../components/Loader.jsx'; // Importar loader para mostrar mientras se cargan los cupones
import CouponCard from '../components/CouponCard.jsx'; // Importar el componente CouponCard para mostrar los cupones

function CouponPage() {
    const navigate = useNavigate(); // Redirigir al usuario a la página de login si no está autenticado o su token no existe
    const [coupons, setCoupons] = useState([]); // Estado para almacenar los cupones
    const [error, setError] = useState(null); // Estado para manejar errores


    const user = useJWTBoilerplate(localStorage.getItem('userToken') || ''); // Obtener el token de usuario del localStorage y pasarlo a la función useJWTBoilerplate para verificar el token y obtener datos del usuario
    useEffect(() => {
        if (!localStorage.getItem('userToken')) { // Revisar si el token de usuario existe
        navigate('/login'); // Redirigir al usuario a la página de inicio de sesión si no existe
    }
        if (!user || !user.userRUN) return;
        const fetchCoupons = async() => {
            try {
                const response = await fetch(`http://localhost:8080/coupons/${user.userRUN}`) // Hacemos una solicitud a la API para obtener los cupones del usuario en base a su RUN
                const couponData = await response.json() // Convertimos la respuesta a JSON
                setCoupons(couponData) // Actualizamos el estado de los cupones con los datos obtenidos
            } catch (error) {
                setError(error) // Si ocurre un error, lo guardamos en el estado de error
            }
        }
        fetchCoupons(); // Llamamos la función para obtener los cupones del usuario
    }, [user]);
    
    if (!coupons.length && !error) return <Loader />; // Mientras se cargan los cupones (y no hay error), mostramos un loader
    return (
        <div>
            <h1>My coupons</h1>
            {error && <p>Error occurred when loading coupons: {error.message}</p>} {/*Mostramos un mensaje de error si ocurre algún problema*/}
            <ul>
                <h1>These coupons are only valid during the indicated date and event.</h1>
                {coupons.map(coupon => <CouponCard key={coupon.eventId} coupon={coupon} />)} {/*Iteramos sobre todos los cupones y creamos un CouponCard para cada uno*/}
            </ul>
        </div>
    )
}

export default CouponPage