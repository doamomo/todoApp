/**
 * //サウンドの変更
 * @function changeSoundIcon
 * //表示関係
 * //プロジェクトのタスク表示
 * @function displayTaskOfSelectProject
 * //選択したプロジェクトのタスクを取得し、画面更新
 * @function displayTaskOfSelectProject
 * //プロジェクトのタスク一覧を取得して表示する
 * @function displayTasks
 * //日付を指定してタスクを取得
 * @function displayTasksByDayColumn
 * 
 * //タスクのボタン有効化
 * //指定されたタスク削除ボタンを有効化、削除後は表示を更新する
 * @function enableTaskDeleteButton
 * //日付ごとのタスク完了状態チェックボタン有効化
 * @function enableTaskStatusChangeButtonSelectedDate
 * //プロジェクト選択時のタスク完了状態チェックボタン有効化
 * @function enableTaskStatusChangeButton
 * 
 * //プロジェクト関係
 * //プロジェクトの一覧を取得して表示する
 * @function displayProjects
 * //プロジェクトの一覧初期表示
 * @function initProjects
 * //プロジェクト入力欄選択中に、Enterを押した際
 * @function inputProject
 * //プロジェクトの削除ボタン有効化
 * @function enableProjectDeleteButton
 * //プロジェクトの削除
 * @function deleteProject
 * //プロジェクトの末尾に追加
 * @function appendProjectDiv
 * 
 * //入力フォーム
 * //タスク入力欄選択中にEnter
 * @function inputTask
 * //日付入力欄に初期値（今日）を設定
 * @function initTaskDate
 * 
 * //左上4ボタン
 * //今日ボタン
 * @function clickToday
 * //明日ボタン
 * @function clickTomorrow
 * //それ以降ボタン
 * @function clickLater
 * //完了済みボタン
 * @function clickCompleted
 * //未完了ボタン
 * @function clickIncomplete
 * 
 * //表示、非表示処理
 * //タスク入力フォームを非表示にする
 * @function removeHiddenClassOfTaskForm
 * //完了済みタスクの表示非表示 
 * @function openComplete
 */

//ビューモデルクラス
class ViewModel {
    #projects;
    #tasks;
    #addProjectHandler = function(el){};
    #removeProjectHandler = function(el){};
    #addTaskHandler = function(el){};
    #removeTaskHandler = function(el){};
    constructor() {
        //プロジェクト一覧
        var self = this;
        this.#projects = new Proxy([], {
            get(target, prop){
                const val = target[prop];
                if(typeof val !== 'function') return val;
                if(prop === 'push'){
                    return function(el){
                        self.addProjectHandler(el);
                        return Array.prototype[prop].apply(target, arguments);
                    }
                }
                if(prop === 'splice'){
                    return function(start, deleteCount){
                        for(let i=0; i<deleteCount; i++){
                            self.removeProjectHandler(this[start+i]);
                        }
                        return Array.prototype[prop].apply(target, arguments);
                    }
                }
                return val;
            }
        });

        //タスク一覧
        this.#tasks = new Proxy([], {
            get(target, prop){
                const val = target[prop];
                if(typeof val !== 'function') return val;
                if(prop === 'push'){
                    return function(el){
                        self.addTaskHandler(el);
                        return Array.prototype[prop].apply(target, arguments);
                    }
                }
                if(prop === 'splice'){
                    return function(start, deleteCount){
                        for(let i=0; i<deleteCount; i++){
                            self.removeTaskHandler(this[start+i]);
                        }
                        return Array.prototype[prop].apply(target, arguments);
                    }
                }
                return val;
            }
        });
    }

    //プロジェクト一覧
    get projects(){ return this.#projects; }
    get addProjectHandler() { return this.#addProjectHandler; }
    set addProjectHandler(fn) { this.#addProjectHandler = fn; }
    get removeProjectHandler() { return this.#removeProjectHandler; }
    set removeProjectHandler(fn) { this.#removeProjectHandler = fn; }

    //タスク一覧
    get tasks(){ return this.#tasks; }
    get incompleteTasks(){ return this.#tasks.filter(task => !task.isCompleted); }
    get completedTasks(){ return this.#tasks.filter(task => task.isCompleted); }
    get addTaskHandler() { return this.#addTaskHandler; }
    set addTaskHandler(fn) { this.#addTaskHandler = fn; }
    get removeTaskHandler() { return this.#removeTaskHandler; }
    set removeTaskHandler(fn) { this.#removeTaskHandler = fn; }
}

//プロジェクトクラス(モデル)
class Project {
    #id = -1;
    #name = '';
    #color = 'black';
    constructor(id, name, color){
        this.id = id;
        this.name = name;
        this.color = color;
    }

    //プロジェクトID
    get id(){ return this.#id; }
    set id(value){ this.#id = value; }

    //名称
    get name(){ return this.#name; }
    set name(value){ this.#name = value; }

    // 色
    get color(){ return this.#color; }
    set color(value){ this.#color = value; }
}

//タスククラス(モデル)
class Task{
    #id = -1;
    #projectId = -1;
    #value = '';
    #completetionDate = '9999-12-31';
    #status = 1;
    constructor(id, projectId, value, completetionDate, status){
        this.id = id;
        this.projectId = projectId;
        this.value = value;
        this.completetionDate = completetionDate;
        this.status = status;
    }

    //タスクID
    get id(){ return this.#id; }
    set id(value){ this.#id = value; }

    //プロジェクトID
    get projectId(){ return this.#projectId; }
    set projectId(value){ this.#projectId = value; }

    //内容
    get value(){ return this.#value; }
    set value(value){ this.#value = value; }

    //期限
    get completetionDate(){ return this.#completetionDate; }
    set completetionDate(value){ this.#completetionDate = value; }

    //ステータス
    get status(){ return this.#status; }
    set status(value){ this.#status = value; }

    //完了したか？
    get isCompleted(){ return this.#status != 1; }

    //期限切れか？
    get isExpired(){
        if (this.isCompleted) return false;
        const completetion_array = this.completetionDate.split("-");
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const date = today.getDate();
        if(year < completetion_array[0]) return false;
        if(year == completetion_array[0] && month < completetion_array[1]) return false;
        if(year == completetion_array[0] && month == completetion_array[1] && date <= completetion_array[2]) return false;
        return true;
    }
}

//ビューモデル
const vm = new ViewModel();
vm.addProjectHandler = appendProjectDiv;
vm.removeProjectHandler = removeProjectDiv;
vm.addTaskHandler = appendTaskDiv;
vm.removeTaskHandler = removeTaskDiv;

//完了済みタスクの表示フラグ(0:非表示)
let openCompleteTaskFlag = 0;
//ダークモードの設定
const options = {
    bottom: '32px', // default: '32px'
    right: '32px', // default: '32px'
    left: 'unset', // default: 'unset'
    time: '0.5s', // default: '0.3s'
    mixColor: '#fff', // default: '#fff'
    backgroundColor: '#fff',  // default: '#fff'
    buttonColorDark: '#100f2c',  // default: '#100f2c'
    buttonColorLight: '#fff', // default: '#fff'
    saveInCookies: true, // default: true,
    label: '🌓', // default: ''
    autoMatchOsTheme: true // default: true
}
//豪華な音
const luxurySoundSrc = "./sound/great.mp3";
const luxurySoundIcon = "campaign";
//シンプルな音
const simpleSoundSrc = "./sound/simple.mp3";
const simpleSoundIcon = "notifications";
//無音
const notSoundSrc = "";
const notSoundIcon = "notifications_off";
//サウンドの初期設定
let sound = new Audio();
const soundVolume = 0.3;
let soundNum = 0;

window.onload = function(){
    //cookieの読み込み
    const readCookies = document.cookie;
    const readCookiesArray = readCookies.split(";");
    let soundCookie = 0;
    readCookiesArray.forEach(element => {
        const cookie = element.split("=");
        if(cookie[0] === "todoSoundType"){
            soundCookie = cookie[1];
        }
    });
    //サウンドの初期設定
    soundNum = Number(soundCookie);
    sound.volume = soundVolume;
    //cookieに合わせたサウンドの切り替え
    changeSound();

    //ダークモード機能
    const darkmode = new Darkmode(options);
    darkmode.showWidget();
    //完了済みタスクの開閉
    document.getElementById("complete_task_button").addEventListener("click", openComplete  );
    //左上リストのボタン機能
    document.getElementById("today_task"          ).addEventListener("click", clickToday    );
    document.getElementById("tomorrow_task"       ).addEventListener("click", clickTomorrow );
    document.getElementById("later_task"          ).addEventListener("click", clickLater    );
    document.getElementById("completed_task"      ).addEventListener("click", clickCompleted);
    document.getElementById("incomplete_task"     ).addEventListener("click", clickIncomplete);

    //サウンドボタン有効化
    document.getElementById("sound").addEventListener("click", function(){
        if(soundNum === 0 || soundNum === 1){
            soundNum++;
        }else if(soundNum === 2){
            soundNum = 0;
        }
        //サウンドの切り替え
        changeSound();
    });

    //プロジェクト選択機能初期化
    let projectElements = $(".main-column-projects-project");
    projectElements.each(function(i, elem){
        $(elem).on("click",function(){
            $(".selected_column").removeClass("selected_column");
            $(elem).addClass("selected_column");
            let select_project_id = $(elem).data("project_id");
            //タスク表示のリセット
            displayTaskOfSelectProject(select_project_id);
        })
    })
    //プロジェクトの一覧初期表示
    initProjects();
    //日付入力欄に初期値（今日）を入力
    initTaskDate();
    //Enterキー入力時の機能
    document.body.addEventListener("keydown", event =>{
        if(event.key === "Enter"){
            let current = document.activeElement;
            //プロジェクト入力欄選択中にEnter
            if(current.id === "input_project"){
                let text = current.value;
                //値が入力されているときのみ処理を行う
                if(text !== ""){
                    inputProject(text);
                }
            //タスク入力欄選択中にEnter
            }else if(current.id === "input_task" || current.id === "input_date"){
                let text = $("#input_task").val();
                if(text !== ""){
                    inputTask(text);
                }
            }
        }
    });
}

/**
 * サウンド設定切り替え
 */
function changeSound(){
    switch(soundNum){
        case 0:
            sound.src = notSoundSrc;
            document.getElementById("sound").innerText = notSoundIcon;
            break;
        case 1:
            sound.src = simpleSoundSrc;
            document.getElementById("sound").innerText = simpleSoundIcon;
            break;
        case 2:
            sound.src = luxurySoundSrc;
            document.getElementById("sound").innerText = luxurySoundIcon;
            break;
    }
    //cookieの保存
    document.cookie = `todoSoundType=${soundNum}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
}

/**
 * @function 選択したプロジェクトのタスクを取得し、画面更新
 * @param project_id:選択したプロジェクトのid
 */
function displayTaskOfSelectProject(project_id){

    //タスクを追加するフォームを表示する
    if($(".main-todo-body-tasks-task").hasClass("hidden")){
        $(".main-todo-body-tasks-task").removeClass("hidden");
    }
    //タスク画面で、選択中のプロジェクトタイトルを変更
    let selectedProjectName = $(".selected_column p").text();
    $("#todo_title").text(selectedProjectName);
    //タスク一覧を表示
    $.ajax("./post.php",
        {
            type: "POST",
            data:{
                value: project_id,
                todo: "selectProjectTask"
            },
            dataType: "json"
        }
    ).done(function(tasksDataArray){
        //返ってきたタスク処理する
        displayTasks(tasksDataArray);
    }).fail(function(XMLHttpRequest, status, e){
        alert("タスクを表示できません\n" + e);
    });
}

/**
 * プロジェクトのタスク一覧を取得して表示する
 * @param tasksDataArray:
 */
function displayTasks(tasksDataArray){
    //変更前のタスク一覧を削除する
    vm.tasks.splice(0, vm.tasks.length);
    for(let i=0; i<tasksDataArray.length; i++){
        let task_id = tasksDataArray[i]["task_id"];
        //新しいタスクのプロジェクトID
        let project_id = tasksDataArray[i]["project_id"];
        //新しいタスクの内容
        let task_value = tasksDataArray[i]["task_value"];
        //新しいタスクの期限
        let task_completetion_date = tasksDataArray[i]["completetion_date"];
        //新しいタスクのstatus
        let task_status = tasksDataArray[i]["task_status"];

        vm.tasks.push(new Task(task_id, project_id, task_value, task_completetion_date, task_status));
    }
    //タスク数の表示を切り替える
    $("#incomplete_task_count").text(vm.incompleteTasks.length);
    $("#complete_task_count").text(vm.completedTasks.length);
}

/**
 * タスク一覧に追加する
 */
function appendTaskDiv(task){
    const showCheck = !$(".selected_column").hasClass("main-column-completed");

    //タスクテンプレートを用いてタスク一覧へ追加
    const template = document.querySelector('#task');
    const clone = template.content.cloneNode(true);
    clone.querySelector('.main-todo-body_tasks').classList.add(task.isCompleted ? 'main-todo-body-complete_tasks' : 'main-todo-body-incomplete_tasks');
    clone.querySelector('.main-todo-body_tasks').setAttribute('data-task_id', task.id);
    if(task.isCompleted && openCompleteTaskFlag == 0){
        clone.querySelector('.main-todo-body_tasks').classList.add('hidden');
    }
    let color = '#777777';
    for(project of vm.projects){
        if(project.id != task.projectId) continue;
        color = project.color;
        break;
    }
    clone.querySelector(".task_project_color").setAttribute("style", `background-color: ${color};`);
    if(showCheck){
        clone.querySelector('.check_task').classList.add(task.isCompleted ? 'check-complete_task' : 'check-incomplete_task');
        clone.querySelector('.check_task').textContent = (task.isCompleted ? 'done' : 'crop_square');
    }else{
        clone.querySelector('.check_task').remove();
    }
    clone.querySelector('.task_value').classList.add(task.isCompleted ? 'task_value_complete' : 'task_value_incomplete');
    clone.querySelector('.task_value').textContent = task.value;
    clone.querySelector('.task_date').classList.add(task.isCompleted ? 'task_date_complete' : 'task_date_incomplete');
    clone.querySelector('.task_date').textContent = `期限:${task.completetionDate}`;
    //期限切れの場合、赤字にする
    if(task.isExpired){
        clone.querySelector('.task_date').classList.add('red');
    }
    clone.querySelector('.delete_task').classList.add(task.isCompleted ? 'delete_complete_task' : 'delete_incomplete_task');
    $(task.isCompleted ? "#complete_tasks" : "#incomplete_tasks").append(clone);
    //表示タスクの作業状態変更を有効化する
    let newTask = $(`[data-task_id=${task.id}]`);
    if(showCheck){
        if($(".selected_column").hasClass("main-column-projects-project")){
            newTask.find(".check-incomplete_task,.check-complete_task").on("click",{task_id: task.id, task_status: task.status}, enableTaskStatusChangeButton);
        }else{
            let day;
            if($(".selected_column").hasClass("main-column-today")){
                day = "today";
            }else if($(".selected_column").hasClass("main-column-tomorrow")){
                day = "tomorrow";
            }else if($(".selected_column").hasClass("main-column-later")){
                day = "later";
            }else if($(".selected_column").hasClass("main-column-incomplete")){
                day = "incomplete";
            }
            newTask.find(".check-incomplete_task,.check-complete_task").on("click",{task_id: task.id, task_status: task.status, selected_column: day}, enableTaskStatusChangeButtonSelectedDate);
        }
    }
    //表示タスクの削除ボタン有効化
    newTask.find(".delete_complete_task,.delete_incomplete_task").on("click", {value: task.id}, enableTaskDeleteButton);
}

/**
 * タスク一覧クリア
 */
function removeTaskDiv(task){
    $(`[data-task_id=${task.id}]`).remove();
}

/**
 * 日付を指定してタスクを取得
 * @param day :検索表示する日付 
 * 
*/
 function displayTasksByDayColumn(day){
    let today = new Date();
    let finishDate;
    let finishDateTimestamp;
    let todo;
    switch(day){
        case "today":
            finishDate = today;
            todo = "selectTaskFromOneDay";
            break;
        case "tomorrow":
            finishDateTimestamp = today.getTime() + (1000 * 60 * 60 * 24 * 1);
            finishDate = new Date(finishDateTimestamp);
            todo = "selectTaskFromOneDay";
            break;
        case "later":
            finishDateTimestamp = today.getTime() + (1000 * 60 * 60 * 24 * 2);
            finishDate = new Date(finishDateTimestamp);
            todo = "selectTaskFromThatDay";
            break;
        case "incomplete":
            finishDateTimestamp = today.getTime() - (1000 * 60 * 60 * 24 * 1);
            finishDate = new Date(finishDateTimestamp);
            todo = "selectTaskUntilYesterday";
            break;

    }
    let searchDate = finishDate.getFullYear() + "-" + (finishDate.getMonth() + 1) + "-" + finishDate.getDate();
    //searchDate = new Date(finishDate.getFullYear(), finishDate.getMonth(), finishDate.getDate());

    //Ajax
    $.ajax("./post.php",
            {
                type: "POST",
                data:{
                    finish_date: searchDate,
                    todo: todo
                },
                dataType: "json"
            }
        ).done(function(tasksDataArray){
            displayTasks(tasksDataArray);
        }).fail(function(XMLHttpRequest, status, e){
            alert("タスクを表示できませんでした\n" + e);
        });
}

/**
 * @function 指定のタスクの削除ボタンを有効化する
 * ボタンをクリックした際、プロジェクト選択時はそのid（異なる場合はNull）を送る
 * データベースからタスクの情報を削除し、表示を更新する
 * @param task_id_data:dataオブジェクト
 */
 function enableTaskDeleteButton(task_id_data){
    //プロジェクト選択はプロジェクトのidをAjaxで送る
    //
    let project_id;
    if($(".selected_column").hasClass("main-column-projects-project")){
        project_id = $(".selected_column").data("project_id");
    }else{
        project_id = null;
    }
    task_id = task_id_data.data.value;
    $.ajax("./post.php",
        {
            type: "POST",
            data:{
                project_id: project_id,
                task_id: task_id,
                todo: "deleteTask"
            },
            dataType: "json"
        }
    ).done(function(tasksDataArray){
        //返ってきたタスク処理する
        //プロジェクト選択時ではない場合、tasksDataArrayには"notProject"が入っている
        if(tasksDataArray !== "notProject"){
            for(let i=0; i<vm.tasks.length; i++){
                if(vm.tasks[i].id != task_id) continue;
                vm.tasks.splice(i, 1);
            }
            //タスク数の更新
            $("#incomplete_task_count").text(vm.incompleteTasks.length);
            $("#complete_task_count").text(vm.completedTasks.length);      
        }else{
            displayTasks(tasksDataArray);
        }
    }).fail(function(XMLHttpRequest, status, e){
        alert("タスクを削除できません\n" + e);
    });
}

//日付ごとのタスク完了状態チェックボタン有効化
function enableTaskStatusChangeButtonSelectedDate(task_id_data){
    task_id = task_id_data.data.task_id;
    task_status = task_id_data.data.task_status;
    selected_column = task_id_data.data.selected_column;
    //タスクのstatusを1,0切り替え
    task_status = 1 - task_status;
    //タスクを完了状態にしたときのみ効果音を鳴らす
    if(task_status === 0 && soundNum !== 0){
        sound.play();
    }
    //Ajax
    $.ajax("./post.php",
        {
            type: "POST",
            data:{
                project_id: null,
                task_id: task_id,
                task_status: task_status,
                todo: "updateTaskStatus"
            },
            dataType: "json"
        }
    ).done(function(data){
        //返ってきたタスク処理する
        switch(selected_column){
            case "today":
                clickToday();
                break;
            case "tomorrow":
                clickTomorrow();
                break;
            case "later":
                clickLater();
                break;
            case "incomplete":
                clickIncomplete();
                break;
        }

    }).fail(function(XMLHttpRequest, status, e){
        alert("タスクの状態を変更できません\n" + e);
    });
}

//タスク完了状態チェックボタン有効化
function enableTaskStatusChangeButton(task_id_data){
    let project_id = $(".selected_column").data("project_id");
    task_id = task_id_data.data.task_id;
    task_status = task_id_data.data.task_status;
    //タスクのstatusを1,0切り替え
    task_status = 1 - task_status;
    //タスクを完了状態にしたときのみ効果音を鳴らす
    if(task_status === 0 && soundNum !== 0){
        sound.play();
    }
    //Ajax
    $.ajax("./post.php",
        {
            type: "POST",
            data:{
                project_id: project_id,
                task_id: task_id,
                task_status: task_status,
                todo: "updateTaskStatus"
            },
            dataType: "json"
        }
    ).done(function(tasksDataArray){
        //返ってきたタスク処理する
        displayTasks(tasksDataArray);
    }).fail(function(XMLHttpRequest, status, e){
        alert("タスクの状態を変更できません\n" + e);
    });
}

//プロジェクトの一覧を取得して表示する
function displayProjects(projectsDataArray){
    for(let i=0; i<projectsDataArray.length; i++){
        const project_id = projectsDataArray[i]["project_id"];
        const project_name = projectsDataArray[i]["project_name"];
        let color = projectsDataArray[i]["color"];
        if(color === null) color = '#777777';
        vm.projects.push(new Project(project_id, project_name, color));
    }
}

//プロジェクトの一覧初期表示
function initProjects(){
    //プロジェクト一覧を表示
    $.ajax("./post.php",
        {
            type: "POST",
            data:{
                todo: "selectProject"
            },
            dataType: "json"
        }
    ).done(function(projectsDataArray){
        //返ってきたプロジェクト処理する
        displayProjects(projectsDataArray);
        //今日のタスク表示
        clickToday();
    }).fail(function(XMLHttpRequest, status, e){
        alert("プロジェクトを表示できません\n" + e);
    });
}

//プロジェクト入力欄選択中に、Enterを押した際
function inputProject(text){
    $.ajax("./post.php",  
        {
            type: "POST",
            data:{
                value: text,
                todo: "insertProject"
            },
            dataType: "json"
        }
    ).done(function(data){
        //追加時、入力したテキストボックスを空にする
        $("#input_project").val("");
        //プロジェクトの末尾に追加
        for (let i=0; i < data.length; i++){
            let color = data[i]["color"];
            if(color === null) color = '#777777';
            vm.projects.push(new Project(data[i]["project_id"], data[i]["project_name"], color));
        }
    }).fail(function(XMLHttpRequest, status, e){
        alert("入力に失敗しました\n" + e);
    });
}

//プロジェクトの末尾に追加
function appendProjectDiv(project)
{
    //新しく追加する要素の用意
    let template = document.querySelector('#project');
    let clone = template.content.cloneNode(true);
    clone.querySelector('.main-column-projects-project').setAttribute('data-project_id', project.id);
    let cpId = `cp-project_id_${project.id}`;
    clone.querySelector('.label_project').htmlFor = cpId;
    clone.querySelector('.color-picker').id = cpId;
    clone.querySelector('.color-picker').value = project.color;
    clone.querySelector('.color-picker').setAttribute('project_id', project.id);
    clone.querySelector('.color-picker').addEventListener('change', function(){
        changeProjectColor(this.getAttribute('project_id'), this.value);
    });
    clone.querySelector('.label_project_icon').style.color = project.color;
    clone.querySelector('.name').textContent = project.name;
    $("#projects").append(clone);

    //追加プロジェクトの削除ボタン有効化
    let newProject = $(".main-column-projects div:last");
    enableProjectDeleteButton(newProject);
    //追加プロジェクトの選択を有効化
    newProject.on("click", function(){
        $(".selected_column").removeClass("selected_column");
        newProject.addClass("selected_column");
        //追加プロジェクト選択時には、該当のタスクを表示する
        let select_project_id = $(this).data("project_id");
        displayTaskOfSelectProject(select_project_id);
    });
}

//プロジェクトを除去
function removeProjectDiv(project)
{
    let deleteElement = $(`[data-project_id=${project.id}]`);
    deleteElement.remove();
}

//プロジェクトの削除ボタン有効化
function enableProjectDeleteButton(element){
    let enableButton = element.find(".delete_project_button");
    enableButton.on("click", function(){
        let buttonId = element.attr("data-project_id");
        deleteProject(buttonId);
    })
}

//プロジェクトの色変更
function changeProjectColor(id, color){
    $.ajax("./post.php",
        {
            type: "POST",
            data:{
                project_id: id,
                color: color,
                todo: "updateProjectColor"
            },
            dataType: "json"
        }
    ).done(function(data){
        if(data != 1){
            alert("プロジェクト色変更できませんでした");
            return;
        }
        for(project of vm.projects){
            if(project.id != id) continue;
            project.color = color;
            const projectDiv = $(`[data-project_id=${project.id}]`);
            const icons = projectDiv.find('.label_project_icon');
            for(const icon of icons){
                icon.style.color = project.color;
            }
            break;
        }
        for(task of vm.tasks){
            if(task.projectId != id) continue;
            const taskDiv = $(`[data-task_id=${task.id}]`);
            const stickies = taskDiv.find('.task_project_color');
            for(const sticky of stickies){
                sticky.style.backgroundColor = color;
            }
        }
    }).fail(function(XMLHttpRequest, status, e){
        alert("プロジェクト色変更できませんでした" + e);
    });
}

//プロジェクトの削除
function deleteProject(id){
    //確認ダイアログ
    if(window.confirm("プロジェクトを削除してもよろしいですか？")){
        $.ajax("./post.php",
            {
                type: "POST",
                data:{
                    project_id: id,
                    todo: "deleteProject"
                },
                dataType: "json"
            }
        ).done(function(data){
            //削除プロジェクトが選択中か確認する
            let selectedColumn = $(".selected_column");
            let selectedColumnId;
            let isDeletedProjectWasSelected = false;
            if(selectedColumn.hasClass("main-column-projects-project")){
                selectedColumnId = String(selectedColumn.data("project_id"));
                if(data === selectedColumnId){
                    isDeletedProjectWasSelected = true;
                }
            }
            //削除したプロジェクトを画面表示から消す
            for(let i=0; i<vm.projects.length; i++){
                if(vm.projects[i].id != data) continue;
                vm.projects.splice(i, 1);
                break;
            }
            //削除プロジェクトが選択中だった場合、タスク画面表示を変更する
            if(isDeletedProjectWasSelected){
                vm.tasks.splice(0, vm.tasks.length);
                $("#incomplete_task_count").text(vm.incompleteTasks.length);
                $("#complete_task_count").text(vm.completedTasks.length);
                $("#todo_title").text("プロジェクト未選択");
                $(".main-todo-body-tasks-task").addClass("hidden");
            }
        }).fail(function(XMLHttpRequest, status, e){
            alert("削除できませんでした" + e);
        });
    }
}

//タスク入力欄選択中にEnter
function inputTask(text){
    //日付未入力の場合、表示をして終了
    if($("#input_date").val() == false){
        alert("日付を入力してください");
        return;
    }
    //プロジェクト選択中なら、プロジェクトのIDとタスクの内容と、期限を取得
    let selectedColumn = $(".selected_column");
    if(selectedColumn.hasClass("main-column-projects-project")){
        let project_id = selectedColumn.data("project_id");
        let completetion_date = $("#input_date").val();
        //AjaxでPOSTする
        $.ajax("./post.php",
            {
                type: "POST",
                data:{
                    project_id: project_id,
                    task_value: text,
                    completetion_date: completetion_date,
                    todo: "insertTaskToProject"
                },
                dataType: "json"
            }
        ).done(function(tasksDataArray){
            //入力したタスク名を空白にする
            $("#input_task").val("");
            displayTasks(tasksDataArray);
        }).fail(function(XMLHttpRequest, status, e){
            alert("タスクを追加できませんでした\n" + e);
        });
    
    }else{
        alert("タスクの追加対象プロジェクトが選択されていません");
    }  
}

//日付入力欄に初期値（今日）を設定
function initTaskDate(){
    let todayDate = new Date();
    let year = todayDate.getFullYear();
    let month = todayDate.getMonth() + 1;
    //0詰めにする
    if(month < 10){
        month = "0" + month;
    }
    let day = todayDate.getDate();
    if(day < 10){
        day = "0" + day;
    }
    //フォームの初期値を表示
    let todayInit = year + "-" + month + "-" + day;
    $("#input_date").val(todayInit);
}

//今日ボタン
function clickToday(){
    $(".selected_column").removeClass("selected_column");
    $("#today_task").addClass("selected_column");
    removeHiddenClassOfTaskForm();
    let selectedColumnName = "今日";
    $("#todo_title").text(selectedColumnName);
    displayTasksByDayColumn("today");
}

//明日ボタン
function clickTomorrow(){
    $(".selected_column").removeClass("selected_column");
    $("#tomorrow_task").addClass("selected_column");
    removeHiddenClassOfTaskForm();
    let selectedColumnName = "明日";
    $("#todo_title").text(selectedColumnName);
    displayTasksByDayColumn("tomorrow");
}
//それ以降ボタン
function clickLater(){
    $(".selected_column").removeClass("selected_column");
    $("#later_task").addClass("selected_column");
    removeHiddenClassOfTaskForm();
    let selectedColumnName = "それ以降";
    $("#todo_title").text(selectedColumnName);
    displayTasksByDayColumn("later");
}

//完了済みボタン
function clickCompleted(){
    $(".selected_column").removeClass("selected_column");
    $("#completed_task").addClass("selected_column");
    removeHiddenClassOfTaskForm();
    //タスク画面で、選択中のプロジェクトタイトルを変更
    let selectedColumnName = "完了済み";
    $("#todo_title").text(selectedColumnName);

    //Ajax
    $.ajax("./post.php",
            {
                type: "POST",
                data:{
                    todo: "selectCompletedTasks"
                },
                dataType: "json"
            }
        ).done(function(data){
            displayTasks(data);
        }).fail(function(XMLHttpRequest, status, e){
            alert("タスクを表示できませんでした\n" + e);
        });
}

//未完了タスクの表示
function clickIncomplete(){
    $(".selected_column").removeClass("selected_column");
    $("#incomplete_task").addClass("selected_column");
    removeHiddenClassOfTaskForm();
    let selectedColumnName = "期限超過";
    $("#todo_title").text(selectedColumnName);
    displayTasksByDayColumn("incomplete");
}

//タスク入力フォームを非表示にする
function removeHiddenClassOfTaskForm(){
    if(!$(".main-todo-body-tasks-task").hasClass("hidden")){
        $(".main-todo-body-tasks-task").addClass("hidden");
    }
}

//完了済みタスクの表示非表示 
const display_on_text = "完了済みのタスクを非表示";
const display_none_text = "完了済みのタスクを表示";

function openComplete(){
    let completeTasks = document.getElementsByClassName("main-todo-body-complete_tasks");
    //非表示にする
    if(openCompleteTaskFlag == 1){

        for(let i=0; i<completeTasks.length; i++){
            completeTasks[i].classList.add("hidden");
        }
        $("#complete_task_button").find("p").html(display_none_text);
    //表示させる
    }else{
        for(let i=0; i<completeTasks.length; i++){
            completeTasks[i].classList.remove("hidden");
        }
        $("#complete_task_button").find("p").html(display_on_text);
    }
    //フラグの切り替え
    openCompleteTaskFlag = 1 - openCompleteTaskFlag;
}
