<?php

include_once('./config/DB.php');

date_default_timezone_set('Asia/Tokyo');

$pdo = null;
$result_array = array();

//SQL実行結果
abstract class Result
{
    public const SKIPPED = -1;
    public const FAILURE = 0;
    public const SUCCESS = 1;
}

//SQL実行
function execute($sql) {
    global $pdo;
    global $result_array;

    //PDOオブジェクトがnullの場合はデータベース未接続とみなす
    if ($pdo === null) {
        array_push($result_array, array(
            'sql' => $sql,
            'datetime' => date("Y-m-d H:i:s"),
            'result' => Result::SKIPPED,
            'message' => 'データベース未接続のためスキップしました'));
        return;
    }

    $result = false;
    $message = null;
    try {
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute();
    } catch (PDOException $e) {
        $message = $e->getMessage();
    }

    array_push($result_array, array(
        'sql' => $sql,
        'datetime' => date("Y-m-d H:i:s"),
        'result' => $result ? Result::SUCCESS : Result::FAILURE,
        'message' => $message));
}

//SQL実行スキップ
function skipExecute($sql, $message = null) {
    global $result_array;

    array_push($result_array, array(
        'sql' => $sql,
        'datetime' => date("Y-m-d H:i:s"),
        'result' => Result::SKIPPED,
        'message' => $message));
}

//テーブル存在確認
function existsTable($table_name) {
    global $pdo;

    //PDOオブジェクトがnullの場合はデータベース未接続とみなす
    if ($pdo === null) {
        return false;
    }

    //テーブル存在確認
    $sql = <<< EOF
-- テーブル存在確認
SELECT
 1
FROM
 `${table_name}`;
EOF;
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return true;
    } catch (PDOException $e) {
    }

    return false;
}

//テーブル列存在確認
function existsTableColumn($table_name, $column_name) {
    global $pdo;

    //PDOオブジェクトがnullの場合はデータベース未接続とみなす
    if ($pdo === null) {
        return false;
    }

    //テーブル列存在確認
    $sql = <<< EOF
-- テーブル列存在確認
SHOW COLUMNS FROM
 `${table_name}`
LIKE
 :column_name;
EOF;
    try {
        $stmt = $pdo->prepare($sql);
        if (!$stmt->execute(array(':column_name' => $column_name))) {
            return false;
        }
        $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (count($array) === 1) {
            return true;
        }
    } catch (PDOException $e) {
    }

    return false;
}

//テーブルインデックス存在確認
function existsTableIndex($table_name, $key_name) {
    global $pdo;

    //PDOオブジェクトがnullの場合はデータベース未接続とみなす
    if ($pdo === null) {
        return false;
    }

    //テーブルインデックス存在確認
    $sql = <<< EOF
-- テーブルインデックス存在確認
SHOW INDEX FROM
 `${table_name}`
WHERE
 key_name = :key_name;
EOF;
    try {
        $stmt = $pdo->prepare($sql);
        if (!$stmt->execute(array(':key_name' => $key_name))) {
            return false;
        }
        $array = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (count($array) === 1) {
            return true;
        }
    } catch (PDOException $e) {
    }

    return false;
}

//DB接続
$sql = '-- CONNECT';
$result = false;
$message = null;
try {
    $pdo = new PDO(DB::dsn, DB::username, DB::password);
    $result = true;
} catch (PDOException $e) {
    $message = $e->getMessage();
}
array_push($result_array, array(
    'sql' => '-- CONNECT',
    'datetime' => date("Y-m-d H:i:s"),
    'result' => $result ? Result::SUCCESS : Result::FAILURE,
    'message' => $message));

try {
    if ($pdo !== null) {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
} catch (PDOException $e) {
}


//**** ver1.3.1 (2021/08/30 18:17 JST) ****
//初期テーブル作成

//プロジェクトテーブル作成
$sql = <<< EOF
-- projectテーブル作成
CREATE TABLE
  `project`
(
  `project_id` int(11) AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `project_name` varchar(30),
  `project_status` int(1)
);
EOF;
if (!existsTable('project')) {
    execute($sql);
} else {
    skipExecute($sql, '`project`テーブル がすでに存在するためスキップしました');
}

//タスクテーブル作成
$sql = <<< EOF
-- taskテーブル作成
CREATE TABLE
  `task`
(
  `task_id` int(11) AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `project_id` int(11),
  `task_value` varchar(30),
  `completetion_date` date,
  `task_status` int(1)
);
EOF;
if (!existsTable('task')) {
    execute($sql);
} else {
    skipExecute($sql, '`task`テーブル がすでに存在するためスキップしました');
}


//**** ver1.3.2 (2021/09/01 18:55 JST) ****
//タスクテーブル project_id列 に外部キー制約を追加

//タスクテーブル project_id列 NOT NULL 制約追加
$sql = <<< EOF
-- taskテーブル project_id列 NOT NULL 制約追加
ALTER TABLE `task` MODIFY `project_id` int(11) NOT NULL;
EOF;
if (existsTableColumn('task', 'project_id')){
    execute($sql);
} else {
    skipExecute($sql, '`task`テーブル `project_id`列 が存在しないためスキップしました');
}

//タスクテーブルproject_id列 外部キー制約追加
$sql = <<< EOF
-- taskテーブル project_id列 外部キー制約追加
ALTER TABLE `task` ADD FOREIGN KEY `fk_project_id`(`project_id`)
  REFERENCES `project`(`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;
EOF;
if (!existsTableIndex('task', 'fk_project_id')){
    execute($sql);
} else {
    skipExecute($sql, '`task`テーブル `fk_project_id`外部キー制約 がすでに存在するためスキップしました');
}


//**** ver1.6.0 (2021/09/29 18:21 JST) ****
//プロジェクトの色分けを実装

//プロジェクトテーブル color列 追加
$sql = <<< EOF
-- projectテーブル color列 追加
ALTER TABLE `project` ADD `color` varchar(30);
EOF;
if (!existsTableColumn('project', 'color')){
    execute($sql);
} else {
    skipExecute($sql, '`project`テーブル `color`列 がすでに存在するためスキップしました');
}


//**** ver1.7.0 (2021/10/29 18:21 JST) ****
//スキン設定

//スキンテーブル作成
$sql = <<< EOF
-- skinテーブル作成
CREATE TABLE
  `skin`
(
  `key` varchar(30) NOT NULL,
  `row_index` int(11) NOT NULL,
  `value` text,
  PRIMARY KEY(`key`, `row_index`)
);
EOF;
if (!existsTable('skin')) {
    execute($sql);
} else {
    skipExecute($sql, '`skin`テーブル がすでに存在するためスキップしました');
}

$pdo = null;
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>To-Do [Deploy Database]</title>
    <style>
        .sql {
            background-color: #eee;
        }
    </style>
</head>

<body>
    <pre class="sql">
<?php foreach ($result_array as $result) {
    echo htmlspecialchars($result['sql']) . PHP_EOL;
    echo '-- =&gt; ' . $result['datetime'] . ' ** ';
    switch ($result['result']) {
        case Result::SKIPPED:
            echo 'スキップ';
            break;
        case Result::FAILURE:
            echo '失敗';
            break;
        case Result::SUCCESS:
            echo '成功';
            break;
        default:
            echo '不明';
    }
    echo ' **' . PHP_EOL;
    if ($result['message'] !== null) {
        echo '-- =&gt; ' . htmlspecialchars($result['message']) . PHP_EOL;
    }
    echo PHP_EOL;
} ?>
    </pre>
</body>

</html>
