<?php

include_once('./config/DB.php');
include_once('./SQL.php');

//Ajaxで送られたtodoパラメータに応じた処理を行う
switch ($_POST['todo']) {
    case "insertProject":
        insertProject();
        break;
    case "deleteProject":
        deleteProject();
        break;
    case "updateProject":
        updateProject();
        break;
    case "insertTaskToProject":
        insertTaskToProject();
        break;
    case "selectProject":
        selectProject();
        break;
    case "selectTasks":
        selectTasks();
        break;
    case "deleteTask":
        deleteTask();
        break;
    case "updateTaskStatus":
        updateTaskStatus();
        break;
}

//タスクの完了状態変更
function updateTaskStatus()
{
    $project_id = $_POST['project_id'];
    $task_id = $_POST['task_id'];
    $task_status = $_POST['task_status'];
    //データの更新
    SQL::updateTaskStatus($task_id, $task_status);
    //更新後のタスクの取得
    $data = null;
    if($project_id === null){
        $data = "notProject";
    }else{
        $data = SQL::selectTasks($project_id, null, null, null);
    }

    header("Content-type: application/json; charset=UTF-8");
    echo json_encode($data);
    exit;
}

//タスクの削除
function deleteTask()
{
    $task_id = $_POST['task_id'];
    //データの削除
    $data = SQL::deleteTask($task_id);
    //更新後のタスクの取得
    header("Content-type: application/json; charset=UTF-8");
    echo json_encode($data);
    exit;
}

//プロジェクト一覧を返す
function selectProject()
{
    $data = SQL::selectProject();
    header("Content-type: application/json; charset=UTF-8");
    echo json_encode($data);
    exit;
}

//タスク一覧を返す
function selectTasks()
{
    $project_id = isset($_POST['project_id']) ? $_POST['project_id'] : null;
    $date_from = isset($_POST['date_from']) ? $_POST['date_from'] : null;
    $date_to = isset($_POST['date_to']) ? $_POST['date_to'] : null;
    $status = isset($_POST['status']) ? $_POST['status'] : null;
    //該当タスク取得
    $new_tasks_row = SQL::selectTasks($project_id, $date_from, $date_to, $status);
    //新しいタスクのデータを返す
    header("Content-type: application/json; charset=UTF-8");
    echo json_encode($new_tasks_row);
    exit;
}

//プロジェクトの追加を行い、追加したプロジェクトを返す
function insertProject()
{
    $data = $_POST['value'];
    //プロジェクトの追加SQL送信
    $project_id = SQL::insertProject($data);
    //新しいプロジェクトのデータを返す
    header("Content-type: application/json; charset=UTF-8");
    echo json_encode($project_id);
    exit;
}

//プロジェクトの削除を行い、画面表示を行うためのプロジェクトの配列を返す

function deleteProject()
{
    $project_id = $_POST['project_id'];
    //データの削除
    SQL::deleteProject(DB::h($project_id));
    header("Content-type: application/json; charset=UTF-8");
    echo json_encode($_POST['project_id']);
    exit;
}

//プロジェクト内容更新
function updateProject()
{
    $project_id = $_POST['project_id'];
    $project_name = isset($_POST['project_name']) ? $_POST['project_name'] : null;
    $color = isset($_POST['color']) ? $_POST['color'] : null;
    //データの更新
    $count = SQL::updateProject($project_id, $project_name, $color);

    header("Content-type: application/json; charset=UTF-8");
    echo json_encode($count);
    exit;
}

//タスクの追加を行い、画面表示を行うためのタスクの配列を返す
function insertTaskToProject()
{
    //タスクの追加
    SQL::insertTaskToProject(DB::h($_POST['project_id']), DB::h($_POST['task_value']), DB::h($_POST['completetion_date']));
    //タスク追加後のプロジェクト内のタスク取得
    $data = SQL::selectTasks($_POST['project_id'], null, null, null);
    header("Content-type: application/json; charset=UTF-8");
    echo json_encode($data);
    exit;
}
