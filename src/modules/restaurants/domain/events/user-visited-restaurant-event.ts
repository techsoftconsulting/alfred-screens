import AppEvent from '@shared/domain/models/app-event';

export const USER_VISITED_RESTAURANT = 'USER_VISITED_RESTAURANT';

export default class UserVisitedRestaurantEvent extends AppEvent {

    eventName(): string {
        return USER_VISITED_RESTAURANT;
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