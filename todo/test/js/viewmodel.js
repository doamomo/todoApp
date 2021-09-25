(function(){
    'use strict';

    /**
     * test function
     * @param {string} desc
     * @param {function} fn
     */
    function it(desc, fn){
        try {
            fn();
            console.log('\x1b[32m%s\x1b[0m', '\u2714 ' + desc);
        }catch(error){
            console.log('\n');
            console.log('\x1b[31m%s\x1b[0m', '\u2718 ' + desc);
            console.error(error);
        }
    }

    function assert(isTrue){
        if(!isTrue){
            throw new Error();
        }
    }

    it('test project', function(){
        let project = new Project(1, "テストProject");
        assert(project.id === 1);
        assert(project.name === "テストProject");
    });

    it('test viewmodel projects', function(){
        let viewModel = new ViewModel();
        assert(viewModel.projects.length === 0);

        let project = new Project(1, "テストProject");
        viewModel.addProject(project);
        assert(viewModel.projects.length === 1);

        viewModel.clearProjects();
        assert(viewModel.projects.length === 0);
    });

    it('test task', function(){
        let task = new Task(1, 2, "テストTask", "2021-09-22", 3);
        assert(task.id === 1);
        assert(task.projectId === 2);
        assert(task.value === "テストTask");
        assert(task.completetionDate === '2021-09-22');
        assert(task.status === 3);
    });

    it('test viewmodel tasks', function(){
        let viewModel = new ViewModel();
        assert(viewModel.tasks.length === 0);

        let task = new Task(1, 2, "テストTask", "2021-09-22", 3);
        viewModel.addTask(task);
        assert(viewModel.tasks.length === 1);

        viewModel.clearTasks();
        assert(viewModel.tasks.length === 0);
    });

    it('test task completed', function(){
        let task = new Task(1, 2, "テストTask", "2021-09-22", 1);
        assert(task.isCompleted === false);

        task.status = 0;
        assert(task.isCompleted === true);
    });

    it('test task expired', function(){
        let today = new Date();
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let task = new Task(1, 2, "テストTask", `${today.getFullYear()}-${("0"+(today.getMonth()+1)).slice(-2)}-${("0"+today.getDate()).slice(-2)}`, 1);
        assert(task.isCompleted === false);
        assert(task.isExpired === false);

        task.completetionDate = `${yesterday.getFullYear()}-${("0"+(yesterday.getMonth()+1)).slice(-2)}-${("0"+yesterday.getDate()).slice(-2)}`;
        assert(task.isExpired === true);
    });
})();
