import AppEvent from '@shared/domain/models/app-event';

export const USER_SEARCHED_RESTAURANT = 'USER_SEARCHED_RESTAURANT';

export default class UserSearchedRestaurantEvent extends AppEvent {

    eventName(): string {
        return USER_SEARCHED_RESTAURANT;
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