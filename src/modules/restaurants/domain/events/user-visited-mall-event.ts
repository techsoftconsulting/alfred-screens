import AppEvent from '@shared/domain/models/app-event';

export const USER_VISITED_MALL = 'USER_VISITED_MALL';

export default class UserVisitedMallEvent extends AppEvent {

    eventName(): string {
        return USER_VISITED_MALL;
    }

    get type(): string {
        return 'USER_ACTION';
    }

    toPrimitives() {
        return {
            ...this.props,
            type: this.type,
            name: this.eventName()
        };
    }

}