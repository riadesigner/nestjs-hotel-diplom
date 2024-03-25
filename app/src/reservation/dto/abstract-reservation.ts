import { ObjectId } from 'mongoose';
import { iReservation } from '../entities/reservation.entity';

export type ID = string | ObjectId;

export interface CreateReservationParams {
  userId: ID;
  hotelId: ID;
  roomId: ID;
  dateStart: Date;
  dateEnd: Date;
}

export interface ReservationSearchOptions {
  userId: ID;
  dateStart?: Date;
  dateEnd?: Date;
}

export interface ReturnedReservation {
  startDate: Date;
  endDate: Date;
  hotelRoom: {
    description: string;
    images: string[];
  };
  hotel: {
    title: string;
    description: string;
  };
}

export interface iReservationService {
  addReservation(data: CreateReservationParams): Promise<iReservation>;
  removeReservation(id: ID): Promise<boolean>;
  getReservations(
    filter: ReservationSearchOptions,
  ): Promise<Array<iReservation>>;
  findById(reservationId: ID): Promise<iReservation>;
}
