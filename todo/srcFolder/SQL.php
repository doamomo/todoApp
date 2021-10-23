<?php

include_once("./config/DB.php");

class SQL
{
    //プロジェクトのINSERT
    public static function insertProject($name)
    {
        $project_id = -1;
        try {
            $pdo = new PDO(DB::dsn, DB::username, DB::password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $sql = <<< EOF
INSERT INTO
 `project`
(
 `project_name`,
 `project_status`
)
VALUES
(
 :name,
 1
)
EOF;
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array(':name' => $name));
            $project_id = $pdo->lastInsertId();
        } catch (PDOException $e) {
            die();
        }

        $pdo = null;
        return $project_id;
    }

    //プロジェクトのSELECT
    public static function selectProject($project_id = -1)
    {
        try {
            $pdo = new PDO(DB::dsn, DB::username, DB::password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $sql_project_id = "";
            if ($project_id >= 0)
            {
                $sql_project_id = "AND `project_id` = {$project_id}";
            }
            $sql = <<< EOF
SELECT
 `project_id`,
 `project_name`,
 `color`
FROM
 `project`
WHERE
 `project_status` = 1
{$sql_project_id}
ORDER BY
 `project_id`
EOF;
            $stmt = $pdo->query($sql);
        } catch (PDOException $e) {
            die();
        }

        $pdo = null;
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    //プロジェクトのデリート
    public static function deleteProject($id)
    {
        try {
            $pdo = new PDO(DB::dsn, DB::username, DB::password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $sql = <<< EOF
DELETE FROM
 `project`
WHERE
 `project_id` = :id
EOF;
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array(':id' => $id));
        } catch (PDOException $e) {
            die();
        }

        $pdo = null;
    }

    //プロジェクト内容更新
    public static function updateProject($project_id, $project_name, $color)
    {
        try {
            $pdo = new PDO(DB::dsn, DB::username, DB::password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $sqlSet = "";
            $array = array(':project_id' => $project_id);
            if($project_name != null && strlen($project_name) > 0){
                if(strlen($sqlSet) > 0) $sqlSet .= ",";
                $sqlSet .= " `project_name` = :project_name ";
                $array[":project_name"] = $project_name;
            }
            if($color != null && strlen($color) > 0){
                if(strlen($sqlSet) > 0) $sqlSet .= ",";
                $sqlSet .= " `color` = :color ";
                $array[":color"] = $color;
            }
            $sql = <<< EOF
UPDATE
 `project`
SET
{$sqlSet}
WHERE
 `project_id` = :project_id
EOF;
            $stmt = $pdo->prepare($sql);
            $stmt->execute($array);
        } catch (PDOException $e) {
            die();
        }

        $pdo = null;
        return $stmt->rowCount();
    }

    //プロジェクト選択時、タスクのINSERT
    public static function insertTaskToProject($project_id, $task_value, $completetion_date)
    {
        try {
            $pdo = new PDO(DB::dsn, DB::username, DB::password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $sql = <<< EOF
INSERT INTO
 `task`
(
 `project_id`,
 `task_value`,
 `completetion_date`,
 `task_status`
)
VALUES
(
 :project_id,
 :task_value,
 :completetion_date,
 1
)
EOF;
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array(':project_id' => $project_id, ':task_value' => $task_value, ':completetion_date' => $completetion_date));
        } catch (PDOException $e) {
            die();
        }

        $pdo = null;
    }

    //タスクのSELECT
    public static function selectTasks($project_id, $date_from, $date_to, $status)
    {
        try {
            $pdo = new PDO(DB::dsn, DB::username, DB::password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $sqlWhere = "";
            $array = array();
            if($project_id != null && strlen($project_id) > 0){
                if(strlen($sqlWhere) > 0) $sqlWhere .= "AND";
                $sqlWhere .= " `project_id` = :project_id ";
                $array[":project_id"] = $project_id;
            }
            if($date_from != null && strlen($date_from) > 0){
                if(strlen($sqlWhere) > 0) $sqlWhere .= "AND";
                $sqlWhere .= " `completetion_date` >= STR_TO_DATE(:date_from, '%Y-%m-%d') ";
                $array[":date_from"] = $date_from;
            }
            if($date_to != null && strlen($date_to) > 0){
                if(strlen($sqlWhere) > 0) $sqlWhere .= "AND";
                $sqlWhere .= " `completetion_date` <= STR_TO_DATE(:date_to, '%Y-%m-%d') ";
                $array[":date_to"] = $date_to;
            }
            if($status != null && strlen($status) > 0){
                if(strlen($sqlWhere) > 0) $sqlWhere .= "AND";
                $sqlWhere .= " `task_status` = :status ";
                $array[":status"] = $status;
            }
            if (strlen($sqlWhere) > 0) $sqlWhere = "WHERE" . $sqlWhere;
            $sql = <<< EOF
SELECT
 `task_id`,
 `project_id`,
 `task_value`,
 `completetion_date`,
 `task_status`
FROM
 `task`
{$sqlWhere}
ORDER BY
 `completetion_date`,
 `task_id`
EOF;
            $stmt = $pdo->prepare($sql);
            $stmt->execute($array);
        } catch (PDOException $e) {
            die();
        }

        $pdo = null;
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    //タスクを削除(単発)
    public static function deleteTask($task_id)
    {
        try {
            $pdo = new PDO(DB::dsn, DB::username, DB::password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $sql = <<< EOF
DELETE FROM
 `task`
WHERE
 `task_id` = :id
EOF;
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array(':id' => $task_id));
        } catch (PDOException $e) {
            die();
        }

        $pdo = null;
        return $stmt->rowCount();
    }

    //タスクの完了状態更新
    public static function updateTaskStatus($task_id, $task_status)
    {
        try {
            $pdo = new PDO(DB::dsn, DB::username, DB::password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $sql = <<< EOF
UPDATE
 `task`
SET
 `task_status` = :task_status
WHERE
 `task_id` = :task_id
EOF;
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array(':task_id' => $task_id, ':task_status' => $task_status));
        } catch (PDOException $e) {
            die();
        }

        $pdo = null;
    }
}
