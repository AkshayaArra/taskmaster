import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, Typography } from '@mui/material';

function KanbanBoard({ tasks }) {
  return (
    <DragDropContext>
      <Droppable droppableId='tasks'>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided) => (
                  <Card ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <CardContent>
                      <Typography>{task.title}</Typography>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
export default KanbanBoard;
