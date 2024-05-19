import { Subject, scan } from "rxjs";
import { startWith } from "rxjs/operators";

const data = require("./data.json");

const ACTIONS = {
  ChangeStatus: "ChangeStatus",
  ChangeCurrentProject: "ChangeCurrentProject",
};

function reduce(state, action) {
  switch (action.type) {
    case ACTIONS.ChangeStatus:
      return {
        ...state,
        projects: state.projects.map((project) => {
          if (project.id === parseInt(action.payload.projectId)) {
            return {
              ...project,
              tasks: project.tasks.map((task) => {
                if (task.id === parseInt(action.payload.taskId)) {
                  return {
                    ...task,
                    done: action.payload.value,
                  };
                }
                return task;
              }),
            };
          }
          return project;
        }),
      };
    case ACTIONS.ChangeCurrentProject:
      return {
        ...state,
        currentProgectId: action.payload,
      };
    default:
      return state;
  }
}

class Store {
  constructor() {
    this.actions$ = new Subject();
    this.state$ = this.actions$.asObservable().pipe(
      startWith({ type: "INIT" }),
      scan(reduce, {
        projects: data.projects,
        currentProgectId: 1,
      }),
    );
  }

  dispatch(type, payload = null) {
    this.actions$.next({ type, payload });
  }

  changeStatus(value, taskId, projectId) {
    this.dispatch(ACTIONS.ChangeStatus, {
      projectId: projectId,
      taskId: taskId,
      value: !value,
    });
  }

  changeCurrentProject(projectId) {
    this.dispatch(ACTIONS.ChangeCurrentProject, projectId);
  }
}

const store = new Store();

const stats = document.querySelector(".stats-component");
const tasks = document.body.querySelector(".tasks-component");
const currentProjectChoose = document.querySelector(".choose");

//*** просто перерендерим все, хоть и не эффективно*/
store.state$.subscribe((state) => {
  const data = document.querySelectorAll(".stats-data");
  [...data].forEach((el) => el.remove());

  for (const project of state.projects) {
    const div = document.createElement("div");
    div.classList.add("stats-data");
    div.dataset.id = project.id;
    div.innerHTML = `
      <div>${project.name}</div>
      <div class="numbers">${project.tasks.filter((task) => !task.done).length}</div>
    `;
    stats.insertAdjacentElement("beforeend", div);
  }
  const arr = Array.from(stats.querySelectorAll(".stats-data"));

  const curEl = arr.find(
    (element) =>
      parseInt(element.dataset.id) === parseInt(state.currentProgectId),
  );
  curEl.style.fontWeight = "900";
});

store.state$.subscribe((state) => {
  const currentProjectId = state.currentProgectId;
  const currentProject = state.projects.find(
    (project) => project.id === parseInt(currentProjectId),
  );
  currentProjectChoose.textContent = currentProject.name;
  const data = tasks.querySelectorAll(".tasks-data");
  [...data].forEach((el) => el.remove());

  for (const task of currentProject.tasks) {
    const div = document.createElement("div");
    div.classList.add("tasks-data");
    const name = document.createElement("div");
    name.textContent = task.name;
    const taskStatusEl = document.createElement("div");
    taskStatusEl.classList.add("status");
    taskStatusEl.dataset.id = task.id;
    taskStatusEl.innerHTML = task.done ? "✓" : "";
    div.insertAdjacentElement("beforeend", name);
    div.insertAdjacentElement("beforeend", taskStatusEl);
    tasks.insertAdjacentElement("beforeend", div);
  }

  const statusBtns = document.querySelectorAll(".status");

  [...statusBtns].forEach((btn) => {
    btn.addEventListener("click", (e) => {
      store.changeStatus(
        Boolean(e.target.textContent),
        e.target.dataset.id,
        currentProjectId,
      );
    });
  });
});

store.state$.subscribe((state) => {
  currentProjectChoose.addEventListener("click", () => {
    let chooseEl = document.querySelector(".choose-project");
    if (chooseEl) {
      chooseEl.remove();
    }
    chooseEl = document.createElement("div");

    chooseEl.classList.add("choose-project");
    for (const project of state.projects) {
      const div = document.createElement("div");
      div.innerHTML = `
        <div class="choose__el" data-id="${project.id}">${project.name}</div>
      `;
      chooseEl.insertAdjacentElement("beforeend", div);
    }
    const el = document.body.insertAdjacentElement("beforeend", chooseEl);
    el.style.position = "absolute";
    const { top, left } = document.body
      .querySelector(".tasks-component")
      .getBoundingClientRect();
    console.log(top, left);
    el.style.width = "30%";
    el.style.background = "white";
    el.style.border = "1px solid black";
    el.style.borderRadius = "10px";
    el.style.top = top + 15 + "px";
    el.style.left = left + 15 + "px";
    const arr = Array.from(chooseEl.querySelectorAll(".choose__el"));
    const curEl = arr.find(
      (element) =>
        parseInt(element.dataset.id) === parseInt(state.currentProgectId),
    );
    curEl.style.textDecoration = "underline";
    document.body
      .querySelector(".choose-project")
      .addEventListener("click", (e) => {
        store.changeCurrentProject(e.target.dataset.id);
        chooseEl.remove();
      });
  });
});
