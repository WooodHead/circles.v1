import { Gantt, Task, ViewMode } from "gantt-task-react";
import { ViewSwitcher } from "./components/ViewSwitcher";

import { memo, useState } from "react";
import { useLocalProject } from "../Context/LocalProjectContext";
import { CardType } from "@/app/types";
import useCardService from "@/app/services/Card/useCardService";

import { Box } from "degen";

function GanttChart() {
  const { localProject: project, updateProject } = useLocalProject();
  const { updateCard } = useCardService();
  const currentDate = new Date();

  const cards: Task[] = Object.values(project.cards).map((card: CardType) => ({
    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    end: card?.deadline
      ? new Date(card?.deadline)
      : new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
    name: card.title,
    id: card.id,
    type: "task",
    progress: 0,
  }));

  const onCardUpdate = async (
    card: CardType,
    startDate: Date,
    endDate: Date
  ) => {
    if (!card?.id) return;
    const payload: { [key: string]: any } = {
      title: card.title,
      description: card.description,
      reviewer: card.reviewer,
      assignee: card.assignee,
      project: project?.id,
      circle: project?.parents[0].id,
      type: card.type,
      deadline: endDate,
      labels: card.labels,
      priority: card.priority,
      columnId: card.columnId,
      reward: {
        chain: card.reward.chain,
        token: card.reward.token,
        value: card.reward.value,
      },
    };
    console.log(payload.deadline);
    const res = await updateCard(payload, card.id);
    if (res) {
      updateProject(res.project);
    }
  };

  const [view, setView] = useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = useState<Task[]>(cards);
  const [isChecked, setIsChecked] = useState(true);

  let columnWidth = 65;
  if (view === ViewMode.Year) {
    columnWidth = 350;
  } else if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  const handleTaskChange = (task: Task) => {
    const card = project.cards?.[task.id];
    void onCardUpdate(card, task.start, task.end);
    const newTasks = tasks.map((t) => (t.id === task.id ? task : t));
    setTasks(newTasks);
  };

  const handleClick = (task: Task) => {
    console.log("On Click event Id:" + task.id);
  };

  return (
    <Box style={{ margin: "0rem 1rem 1rem 1rem" }}>
      <ViewSwitcher
        onViewModeChange={(viewMode) => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
        viewMode={view}
      />
      <Gantt
        tasks={tasks}
        viewMode={view}
        onDateChange={handleTaskChange}
        onClick={handleClick}
        listCellWidth={isChecked ? "155px" : ""}
        columnWidth={columnWidth}
      />
    </Box>
  );
}

export default memo(GanttChart);
