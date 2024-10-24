import $ from "https://esm.sh/jquery";
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {getDatabase, ref, set, onValue, get, push, update, remove} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB_1ogjCF83vOJMiOk6mTjVnKlS86PO5lk",
    authDomain: "project1-app-61516.firebaseapp.com",
    projectId: "project1-app-61516",
    storageBucket: "project1-app-61516.appspot.com",
    messagingSenderId: "73738249121",
    appId: "1:73738249121:web:fa9382eb52d61f7a53e1e0",
    measurementId: "G-ETY11Y40Q2",
    databaseURL: "https://project1-app-61516-default-rtdb.firebaseio.com/"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

function Task(title, action, time){
  this.title = title;
  this.action = action;
  this.time = time;
};

$('#home').on('click', async function(){
  $('.view').hide();
  $('.todo').show();
})
$('#submit').on('click', async function(){
  //submit data from username and password textboxes to database on button click
  //once authorized change screen
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  try {
    await signInWithEmailAndPassword(auth, username, password);
        console.log("user id:", auth.currentUser.uid);
        $('.enter').hide();
        $('.todo').show();
    } catch (error) {
        console.log(error);
    }
});

$('#create').on('click', async function(){
  const taskTitle = prompt("name of task");
  const taskAction = prompt("what does this task entail");
  const taskTime = prompt("when will you complete this task");
  
  const userId = auth.currentUser.uid; // Get the authenticated user's ID
  const tasksRef = ref(database, `users/${userId}/tasks`); // Reference to the user's tasks
  const newTaskRef = push(tasksRef);
  await set(newTaskRef, {
     title: taskTitle,
     action: taskAction,
     time: taskTime
    });
});

async function readTasks(){
  $('#taskList').empty();  
  const userId = auth.currentUser.uid;
  const tasksRef = ref(database, `users/${userId}/tasks`);
    
    // Get the current tasks
    get(tasksRef).then((snapshot) => {
        if (snapshot.exists()) {
            const tasks = snapshot.val();
            for (const id in tasks) {
                $('#taskList').append(`
                    <li>
                        ${tasks[id].title} - ${tasks[id].action} - ${tasks[id].time}
                        <button class="delete-btn" data-id="${id}">Delete</button>
                        <button class="edit-btn" data-id="${id}">Edit</button>
                    </li>
                `);
            }
        } else {
            $('#taskList').append('<li>No tasks found.</li>');
        }
    }).catch((error) => {
        console.error("Error fetching tasks:", error);
    });
  $('.todo').hide();
  $('.view').show();
};

$('#read').on('click', async function() {
    await readTasks(); // Load tasks when the button is clicked
});

$(document).on('click', '.edit-btn', async function(){
    const taskId = $(this).data('id');
    const userId = auth.currentUser.uid;
    const taskRef = ref(database, `users/${userId}/tasks/${taskId}`);
    const snapshot = await get(taskRef);
    if (snapshot.exists()){
      const task = snapshot.val();
      const newTaskTitle = prompt("New title", task.title);
      const newTaskAction = prompt("New action", task.action);
      const newTaskTime = prompt("New time", task.time);
    
    await update(taskRef, {
        title: newTaskTitle,
        action: newTaskAction,
        time: newTaskTime
    });
    await readTasks();
}
});


$(document).on('click', '.delete-btn', async function(){
  const taskId = $(this).data('id');
  console.log(taskId);
  const userId = auth.currentUser.uid;
  const taskRef = ref(database, `users/${userId}/tasks/${taskId}`);
  await remove(taskRef)
        .then(() => {
            console.log("Task deleted successfully");
            $(this).parent().remove(); // Remove the task from the UI
        })
        .catch((error) => {
            console.error("Error deleting task:", error);
        });
});