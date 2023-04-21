import { TXR_net_processor, XR_net_packet } from "xray16";

import { EPacketDataType } from "@/fixtures/xray/mocks/save/types";

/**
 * todo;
 */
export class MockNetProcessor {
  public readDataOrder: Array<EPacketDataType> = [];
  public writeDataOrder: Array<EPacketDataType> = [];

  public dataList: Array<unknown>;

  public constructor(dataList: Array<unknown> = []) {
    this.dataList = dataList;
  }

  public r_stringZ(): string {
    this.readDataOrder.push(EPacketDataType.STRING);

    if (this.hasData()) {
      return this.dataList.shift() as string;
    } else {
      throw new Error("Unexpected test mock read.");
    }
  }

  public r_float(): number {
    this.readDataOrder.push(EPacketDataType.F32);

    if (this.hasData()) {
      return this.dataList.shift() as number;
    } else {
      throw new Error("Unexpected test mock read.");
    }
  }

  public r_u32(): number {
    this.readDataOrder.push(EPacketDataType.U32);

    if (this.hasData()) {
      return this.dataList.shift() as number;
    } else {
      throw new Error("Unexpected test mock read.");
    }
  }

  public r_u16(): number {
    this.readDataOrder.push(EPacketDataType.U16);

    if (this.hasData()) {
      return this.dataList.shift() as number;
    } else {
      throw new Error("Unexpected test mock read.");
    }
  }

  public r_u8(): number {
    this.readDataOrder.push(EPacketDataType.U8);

    if (this.hasData()) {
      return this.dataList.shift() as number;
    } else {
      throw new Error("Unexpected test mock read.");
    }
  }

  public r_bool(): boolean {
    this.readDataOrder.push(EPacketDataType.BOOLEAN);

    if (this.hasData()) {
      return this.dataList.shift() as boolean;
    } else {
      throw new Error("Unexpected test mock read.");
    }
  }

  public w_stringZ(data: string): void {
    this.writeDataOrder.push(EPacketDataType.STRING);
    this.dataList.push(data);
  }

  public w_u16(data: number): void {
    this.writeDataOrder.push(EPacketDataType.U16);
    this.dataList.push(data);
  }

  public w_u32(data: number): void {
    this.writeDataOrder.push(EPacketDataType.U32);
    this.dataList.push(data);
  }

  public w_u8(data: number): void {
    this.writeDataOrder.push(EPacketDataType.U8);
    this.dataList.push(data);
  }

  public w_float(data: number): void {
    this.writeDataOrder.push(EPacketDataType.F32);
    this.dataList.push(data);
  }

  public w_bool(data: boolean): void {
    this.writeDataOrder.push(EPacketDataType.BOOLEAN);
    this.dataList.push(data);
  }

  public w_tell(): number {
    return this.writeDataOrder.length;
  }

  public r_tell(): number {
    return this.readDataOrder.length;
  }

  public hasData(): boolean {
    return this.dataList.length > 0;
  }
}

/**
 * todo;
 */
export function mockNetProcessor(packet: MockNetProcessor = new MockNetProcessor()): TXR_net_processor {
  return packet as unknown as XR_net_packet;
}

/**
 * todo;
 */
export function mockNetPacket(packet: MockNetProcessor = new MockNetProcessor()): XR_net_packet {
  return packet as unknown as XR_net_packet;
}
