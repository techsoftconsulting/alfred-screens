import AppEvent from '@shared/domain/models/app-event';

export const USER_BOOKED_RESTAURANT_TABLE = 'USER_BOOKED_RESTAURANT_TABLE';

export default class UserBookedRestaurantTableEvent extends AppEvent {

    eventName(): string {
        return USER_BOOKED_RESTAURANT_TABLE;
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