
# Overview

The following file will introduce the entradas-PP-UAI project and explain the different functions of the files pertaining to it in order for a layperson to use it. 

The web app was developed as a semester-long group project for the TICS420 (Programación Profesional/Professional Programming) course offered by Universidad Adolfo Ibañez as part of its Computer Engineering program. It covers topics such as Git, proper Jira workflows, containerization with Docker, and other practices that people working on long-term software development projects are expected to be familiar with in order to push a full, working product out in a professional environment.

The project we chose involves the creation of a site designed to sell tickets to different events and then let them check into said events, but also to allow its users to safely resell or transfer tickets they might not want anymore, adding checks to stop potential scalpers. 

Users will have their tickets tied to their RUN, which simplifies the check-in process as it will only take a scan of the QR code in the back of their Chilean ID (Cedula de identidad) by an admin to bring up their tickets and mark them as checked in (also preventing ticket reuse).

We've also added features for users to obtain coupons for use within events to obtain discounts or free drinks.

Finally, we also made sure to automatically send an email to admins in case the event starts filling up and gets close to the venue's total capacity.

# Requirements and Instructions

This project uses Deno for dependency management. All third-party modules and their exact versions are locked using the `deno.lock` file in order to ensure consistent builds across environments. As such, Deno v2.0.0 or later is required before running the repo.

You will also need Node.js v20+ for the frontend as it runs on Vite, and also NPM.

Because of Deno+Vite's usage esbuild, it's also expected that the user is using a browser which supports it (Chrome, Firefox, Safari, Edge).

Build the docker image with `docker build -t entradas-pp-uai .`

To start a dev server where localhost:5173 will host the frontend and localhost:8080 will host the backend that connects to the database, the user must run the following command:

>$ deno task dev

After which, the site should be ready for use (assuming the right .env file is provided).

# Usage
This section will detail each function and file in the project with the purpose of being able to understand and expand on it should it be needed.

## Frontend

### Applicable to every page:

While data is loading from the backend, the different components display a loader.

All notifications of success or failure are delivered via toast.
### `src/main.tsx`
Renders our app in the root of the html file.
### `src/App.tsx`
Defines the routes of the website, defines our toast container, and also makes sure our Navbar and Footer is displayed in every page.
### `src/components/navbar.jsx`
Displays buttons to go to the homepage (Home), one that takes you to information regarding the site (About), and one that takes users to the login page (Login). Also included is a search bar that allows users to look for different events.

When a user logs in, the login button is removed, and four other buttons are added:
- Authorization, which takes them to a page that displays the user's account information and gives them a button to log out.
- Tickets, which takes them to a page where they'll be able to see the different orders they've made and the tickets associated to those orders. They'll also be able to see if the tickets has been used to check in.
- Transfer, which takes them to a page where they'll, once again be able to see the different orders they've made. However, here they'll be able to click a button that allows them to transfer their tickets or put them up for resale.
- Reselling, which lets them see and buy tickets that are currently being resold by other users.

In case the user is using a phone, a tab button will appear instead, that when pressed will onl then show each button for accesibility reasons.
### `src/components/footer.jsx`
Displays a small blurb about copyright and some contact info.

### `src/pages/HomePage.jsx`
Serves as the main entry point for the frontend. fetching and displaying a grid of upcoming concerts from the backend API, mapping each one to a ConcertCard component.

A GET request is made to `http://localhost:8080/events` that is expected to return an array of concert/event objects which is iterated upon to map each to a ConcertCard which will include the name of the event, the date, and an ID corresponding to the venue in which it takes place. When clicked, it will take the user to the ticket purchase page. While the request is still ongoing, it will display a loader. In case there's an error, it will be shown via a toast notification.

### `src/components/ConcertCard.jsx`
Takes as prop a concert/event object which includes the following traits:
- concert.id: The ID corresponding to the concert in our database
- concert.title: The concert's title.
- concert.eventDate: The date in which it takes place.
- concert.venueId: The ID corresponding to the venue in our database in which the concert takes place.
Returns a clickable component that will take you to the ticket purchase page for that event. If the prop is not passed or is null, the component renders nothing.

### `src/pages/ConcertPage.jsx`
This component renders the concert detail page and allows users to purchase tickets, showing a QR code with the information of the order (and taking them back to the homepage 100 seconds later) after a successful purchase.

The page uses useParams() to extract the event ID from the URL, and fetches concert details and available tickets from `http://localhost:8080/events/id/:id`, also needing to authenticate the user via JWT which is handled by the useJWTBoilerplate hook. If the user is an admin, the page will also display additional metrics like capacity, check-ins, and remaining spots. If the concert isn't found or the purchase fails, it displays an error via toast. If the user hasn't logged in or selected tickets, blocks the purchase button.

Users can input how many tickets of each type they can purchase, and upon clicking the purchase button, the data is sent to the backend via `http://localhost:8080/purchase`. If the purchase is successful, a QR code is shown that includes the details of the order, and the user is redirected back to the homepage after 100 seconds.

### `src/pages/SearchPage.jsx`
This component handles search results based on the user's query. It extracts the query string from the URL using useParams() and makes a GET request to `http://localhost:8080/events/:query` to retrieve matching events from the backend.

While the request is pending, it displays a loading spinner via the Loader component. If an error occurs (e.g., backend is not running), it shows a descriptive message, and if no results are found, it informs the user.

When events are successfully fetched, it maps them to ConcertCard components, displaying them in a grid layout.

Useful for users trying to find specific concerts or events by name.

### `src/pages/LoginPage.jsx`
This component renders the login page, which delegates all logic and UI responsibilities to the LoginContainer component.

### `src/components/login/LoginContainer.jsx`
This component contains the full logic and UI for user authentication, providing a login form where users input their email and password. On submission, makes a POST request to `http://localhost:8080/login`.
 
If the credentials are valid, it stores the returned JWT and user information, showing a success toast and navigating the user to the home page.

### `src/pages/TicketsPage.jsx`
This component displays the tickets associated with a user. If the user is not logged in, they are redirected to the login page. The token is verified via useJWTBoilerplate, and based on their role, the page behaves differently.

- Normal users are immediately shown their own tickets.

- On load, admins are prompted via UserQRPrompt to either scan a user's RUN from their QR or view their own tickets. Once a RUN is selected, a GET request is sent to `http://localhost:8080/tickets/RUN/:run` to fetch the corresponding orders and ticket items.

While the data is loading, a Loader component is shown. If there's an error, it's displayed as plain text (future versions might use toast). Once loaded, each order is rendered using the TicketCard component.

If the user is an admin, they also gain access to the check-in functionality, allowing them to mark tickets as checked in without refreshing the page.

### `src/pages/AuthPage.jsx`
This component serves as an authentication status page. It displays different content depending on whether the user is logged in.

First it checks for the JWT and verifies it, extracting user attributes and displaying them if succesful, also adding a logout button if the user wishes (which clears the JWT from localStorage and resets local state, then booting the user to the homepage) to and a button to go back to the homepage.

In case it doesn't find a JWT or it fails authentication, it will show a welcome message and prompt the user to either log in or register, showing hyperlinks to both pages.

### `src/pages/CouponsPage.jsx`
This component displays the list of available coupons for a logged-in user. It authenticates the user using the JWT stored in localStorage and fetches coupons from the backend based on the user's RUN. If the user isn't authenticated, they're redirected to the /login page.

Once they're authenticated, a GET request is sent to `http://localhost:8080/coupons/{userRUN}` to retrieve all coupons associated with the user's RUN. If the coupons are successfully fetches, the component renders the title of the page, a message indicating that the coupons are valid only for the specific events they're listed for, and then the array of coupons are iterated upon to create a list of CouponCard components.

### `src/components/CouponCard.jsx`
This component renders a single coupon with its relevant details. It takes in a prop that represents a coupon and its details, an displays the following information:

- coupon.eventId: The ID corresponding to the event the ticket corresponds to
- coupon.code: The actual coupon that is to be used
- coupon.event.title: The name of the event in which it is to be used.
- coupon.event.eventDate: The date in which the event takes place
- coupon.description: A brief description of what the coupon provides (whether that be a discount or free food/drinks).

### `src/pages/TicketTransferPage.jsx`
This component allows authenticated users to view their tickets and initiate ticket transfers or resales.

It authenticates the user's JWT using useJWTBoilerplate and extracts useful data if the token passes authentication. Once it does, it obtains the user's tickets with a fetch request to `http://localhost:8080/tickets/RUN/${user.userRUN}`and lists the ones that have been paid for and haven't been used for check-in. Once a ticket is selected, the user is taken to `/transfer/{orderId}/{ticketId}` to input the details of the transfer or resale.

### `src/pages/TicketDetailPage.jsx`
This component displays the ticket previously selected in `TicketTransferPage.jsx` so the user can see the data pertaining to it. The user is allowed to input a RUN or user ID to transfer the ticket to, or they're allowed to input a resale price with the note that this price cannot be higher than 90% of the original price (the page doesn't prevent them from doing this, but the backend will automatically set the price to 90% of the original if the user doesn't follow the instructions).

Then they're given a button to send the transfer/resale request that creates a payload with the orderId, ticketId, userId (if transfering), and price (if reselling). This payload is sent with a PATCH request to `http://localhost:8080/transfer-ticket`, and once it succeeds, it shows a toast and redirects the user to their tickets. In case of failure, it shows an error alert.

### `src/pages/TicketReselling.jsx`
This component displays all ticket resale orders available in the database and allows the logged-in user to purchase tickets from these resales.
The component obtains the resale orders by a GET request to `http://localhost:8080/orders/reselling`. Once the data has been obtained, the site displays, per resale order, the seller's name and RUN, their email, and the list of tickets they're reselling.

If the user presses the purchase button, it will verify the user's JWT. Once the user has been verified successfully, it will send a POST request to `http://localhost:8080/orders/resell-purchase` with a body containing:

- orderId: The ID of the resale order.
- userId: The ID of the user purchasing it.
- total: The total price of the purchase.

On success, it shows a toast notification indicating the purchase has been successful, and on failure it alerts the user with the error message.

### `src/backend-node/client.ts`

Closer to a backend function, we still feel like we should mention this here considering how prominent it is as it's the way JWT authentication is initiated and finalized from the frontend side of things.

The file includes a custom hook named useJWTBoilerplate that recieves the encrypted JWT (a string) kept in localStorage, where it then sends a POST request to `http://localhost:8080/verify`. If the authentication request is successful, it extracts the user's data from the backend response and saves them in the following way using the UserAtributes interface:

- usermail: The user's mail account.
- userID: The user's designated ID.
- userName: The user's full name.
- userRole: The role the user has (user or admin).
- userRUN: The user's RUN.

This allows us to add authentication in any page we might need to use it for, and also allows the frontend to access important data from the user without leaving it stored in plain sight via localStorage.

## Backend
### `src/backend-node/main.ts`
This is the entry point of the backend. It sets up the Oak application, applies CORS configuration, registers middleware, injects the Prisma client into the context, links the router with the API routes, and finally starts the server on port 8080. 

### `src/backend-node/router.ts`
This file defines and organizes all API's routes of the backend using Oak's Router. It imports controller functions from controller.ts and maps them to their corresponding HTTP endpoints, grouping them by entity. It exports the configured router to be used in main.ts.

### `src/backend-node/controller.ts`
This file implements the core business logic behind each endpoint. It defines asynchronous handler functions that interact with the database via Prisma, perform validations, and return appropriate HTTP responses. Functions include login verification, event listing, ticket purchase and transfer, coupon fetching, and admin actions like check-in and capacity alerts.

### `src/backend-node/client.ts`
This file initializes and exports the PrismaClient to enable communication with the PostgreSQL database. It is used across other backend modules to perform database queries and mutations with full type safety based on the Prisma schema.
# Credits

- BenjaR23: Benjamín Octavio Rodríguez Fuentes 
- DiegoJimenez: Diego Jiménez Riveros
- ZetaBeeM: Felipe Alonso Madrid Jaramillo
