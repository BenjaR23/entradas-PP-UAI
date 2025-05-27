function CouponCard({ coupon }){
    return (
        <li key={coupon.eventId}> {/*Usamos el eventId como key para cada cupón para identificarlas dentro de React*/}
            <h2>{coupon.code}</h2> {/*Mostramos el código del cupón*/}
            <p>Event: {coupon.event.title}</p> {/*Mostramos el título del evento al que pertenece*/}
            <p>Date: {coupon.event.eventDate}</p> {/*Mostramos la fecha del evento*/}
            <p>{coupon.description}</p> {/*Mostramos lo que ofrece el cupón*/}
        </li>
    )
}
export default CouponCard;