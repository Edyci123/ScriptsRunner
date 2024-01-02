# ScriptsRunner

This is a kotlin script runner on web.

### Backend: Spring Boot Framework(Java)
Dependencies:
+ spring-boot-starter-web
+ spring-boot-starter-websocket
+ lombok

### Frontend: React with Typescript
Dependencies:
+ Material UI
+ SockJs
+ StompJs
+ Axios
+ lodash
+ React-Router-DOM

I kept things as vanilla as I could, focusing on the script runner.

### TO RUN THE BACKEND:
You require to have Java 21 installed.
Also, you must have kotlin installed.

If you don't have intellij you can do the following:

To run it on UNIX based systems:
```
cd ./server/
./mnvw spring-boot:run"
```
On Windows:
```
cd ./server/
./mvnw.cmd spring-boot:run
```

### TO RUN THE FRONTEND:
You require to have installed:
+ node
+ npm

```
cd ./app/
npm install
npm start
```

The application will start on localhost on port 3000


### Functionality:

It has 2 panes, an editor and an output pane, on submit the Run button transforms in a circular loading
icon. The output is delivered as the script executes through a WebSocket, and is displayed in the output
pane, at the end it shows the EXIT_CODE. If there are any errors, they will be shown as well as the EXIT_CODE, 
and each one will be clickable and will scroll to where the error is located in the code. In the editor pane
we have the basic keywords highlighted as well as the quotes and the comments, inside these, keywords
won't be highlighted. Also on the backend, when you run a script, it will use separate Threads to 
get the output of the execution of the kotlin script. Added a mechanism to show the progress of the 
execution of a script multiple times. There is a count input, where you enter how many times the script should
run, but also you can check a box, and then all the outputs will be shown. If it has an error, the process
will be stopped.

### Future Improvements:

+ ML model to predict the execution time of a script. Right now, I only have some logic for it implemented,
I can get the features that should count for a script, but I need to gather data to train it. This way
when running a script multiple times, the output would be more exact.
+ Switch to RabbitMQ, as the SimpleMessageBroker is pretty slow, and it has its limits.
+ Should create a lexer and parser to get the keywords more efficiently, but it wasn't enough time for that
+ Find a way to dockerize the app, but right now on the backend it won't let me create a process. This
way you won't require to have kotlin installed locally, also a variant would be to host it on my 
server, but I don't really have access to it, as it's shut down.


Some of the tests might not work, as in the final days of the project I had only my laptop which runs 
macOS and I couldn't exactly test it on windows(I don't have enough storage for a VM), but it should work.