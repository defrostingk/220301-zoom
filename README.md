# See See Call Call

<a href="https://seeseecallcall.herokuapp.com/" target="_blank">Go to use 'See See Call Call'</a>

## Contents

- [Description](#description)

- [Usage In Local Environment](#usage-in-local-environment)

- [Files](#files)

---

## Description

Video call and chat service using NodeJS, WebRTC and Websockets. It has responsive screens for mobile(a narrow screen) and desktop(a wide screen, minimum width is 768px) environment.

- Mobile (A narrow screen)

  - Home screen

    ![mobile_home](https://user-images.githubusercontent.com/95136896/163564606-2086538a-8ba3-4784-ae82-ae539bcfd6e4.png)

  - Call screen

    ![mobile_call](https://user-images.githubusercontent.com/95136896/163564646-853f0b42-7c51-4abc-a775-5621e73603e1.png)

- Desktop (A wide screen)

  - Home screen

    ![desktop_home](https://user-images.githubusercontent.com/95136896/163564655-5bfe6c30-9d0a-4061-be95-e64a9228d095.png)

  - Call screen

    ![desktop_call](https://user-images.githubusercontent.com/95136896/163564659-46aa7ab1-38c1-4bee-a28c-4e5a52ab0ba9.png)

---

## Usage In Local Environment

- prerequisite

  Node.js, webcam(option), mike(option)

1. Install modules.

   ```
   npm i
   ```

2. Run 'See See Call Call'.

   ```
   npm run dev
   ```

- Run 'See See Call Call' using babel

  1. Convert the code using babel after installing the modules.

     ```
     npm i
     npm run build
     ```

  2. Run 'See See Call Call' using the converted code

     ```
     npm start
     ```

---

## Files

- src

  - public

    - css: Styling

      - components: Components that make up the screen

        - button.css: For all buttons

        - chat.css: For a chat area

        - checkbox.css: For all checkboxes

        - footer.css: For a footer

        - header.css: For a home screen's header

        - room-list.css: For a list of room

        - select.css: For all selectboxes

        - submit.css: For entering room and saving user's data forms

      - config: Reset CSS and set variables

        - \_reset.css

        - \_variable.css

      - screens: Align components and screen layout

        - home.css: Home page (Before entering a room)

        - call.css: After entering a room

      - styles.css: Import all .css files and style elements

    - images

      - call.png: For a disconnected or not entered user's video

      - favico.ico: For the title icon

    - js

      - app.js: Handling events, features, making RTC Peer connection

  - views

    - home.pug: Mark up using pug

  - server.js: Settings for the app, WebSockets server(signaling server), and handling events.
