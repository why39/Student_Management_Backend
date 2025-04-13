import { registerEnumType } from '@nestjs/graphql';

export enum ActivityState {
    NEW = 'NEW',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
}

registerEnumType(ActivityState, {
    name: 'ActivityState',
    description: 'The states an activity can be in',
    valuesMap: {
        NEW: {
            description: 'Activity has been created but not started',
        },
        IN_PROGRESS: {
            description: 'Activity is currently in progress',
        },
        COMPLETED: {
            description: 'Activity has been completed',
        },
        CANCELED: {
            description: 'Activity has been canceled',
        },
    },
});