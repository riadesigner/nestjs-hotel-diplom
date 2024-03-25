import { Injectable } from '@nestjs/common';

import {
  CreateReservationParams,
  ID,
  iReservationService,
  ReservationSearchOptions,
} from './dto/abstract-reservation';
import { iReservation } from './entities/reservation.entity';
import { Reservation, ReservationDocument } from './reservation.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ReservationService implements iReservationService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
  ) {}

  findById(reservationId: ID): Promise<iReservation> {
    return new Promise(async (res) => {
      try {
        const r = await this.reservationModel.findById(reservationId);
        res(r);
      } catch (e) {
        console.log('error log', e);
        res(null);
      }
    });
  }

  addReservation(params: CreateReservationParams): Promise<iReservation> {
    return new Promise(async (res) => {
      try {
        const newReserve = new this.reservationModel(params);
        await newReserve.save().then((t) => t.populate('hotelId roomId'));
        res(newReserve);
      } catch (e) {
        console.log('log error', e);
        res(null);
      }
    });
  }
  removeReservation(id: ID): Promise<boolean> {
    return new Promise(async (res) => {
      try {
        await this.reservationModel.deleteOne({ _id: id });
        res(true);
      } catch (e) {
        console.log('log error', e);
        res(null);
      }
    });
  }
  getReservations(filter: ReservationSearchOptions): Promise<iReservation[]> {
    return new Promise(async (res) => {
      try {
        const arrReservations = await this.reservationModel
          .find(filter)
          .populate('roomId hotelId');
        res(arrReservations);
      } catch (e) {
        console.log('log error', e);
        res(null);
      }
    });
  }
}
