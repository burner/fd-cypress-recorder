import { AllFdEvents } from "../utils/CypressDictionary";
import React from "react";
import { ButtonEditorial } from "@fdmg/fd-buttons";
import FdEvent from "./FdEvent";
import { DragDropContext, ResponderProvided, DropResult, Droppable, Draggable } from 'react-beautiful-dnd';
import EventsStore = require("../stores/EventsStore");

declare var chrome: any;

export interface Props {
    events: AllFdEvents[];
    onRemoveEvent: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function EventsList(props: Props) {
    function handleDragEnd(result: DropResult, provided: ResponderProvided) {
        if (!result.destination) return;

        let events = [...props.events];
        const reorder = (list: AllFdEvents[], startIndex: number, endIndex: number) => {
            const result = Array.from(list);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
          
            return result;
        };
        events = reorder(events, result.source.index, result.destination.index);
        EventsStore.addFuture([...EventsStore.getEvents()]);
        EventsStore.setEvents(events);
        chrome.storage.local.set({'fd-cypress-chrome-extension-events': events});
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="events">
                {(provided, snapshot) => (
                    <ul {...provided.droppableProps} ref={provided.innerRef} {...provided.droppableProps}>
                        {props.events.map((event: AllFdEvents, idx: number) => (
                            <Draggable key={idx} draggableId={`${(event as any).id}`} index={idx}>
                                {(provided, snapshot) => (
                                    <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                        <FdEvent event={event}/><ButtonEditorial className="toggle-view" data-index={idx} onClick={props.onRemoveEvent} title="Delete event">x</ButtonEditorial>
                                    </li>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </ul>
                )}
            </Droppable>
        </DragDropContext>
    );
}