import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import e from "express";
var Ptouch = require("node-ptouch");
var net = require("net");

@Injectable()
export class PtouchService extends Ptouch {
  constructor(private config: ConfigService) {
    super(config.get("PTOUCH_ITEM_LABEL_TEMPLATE_ID"), { copies: 1 });
  }

  printItemLabel(url: string, itemId: string, itemName: string): Promise<void> {
    this.insertData("url", url);
    this.insertData("itemId", itemId);
    this.insertData("itemName", itemName);

    var data = this.generate();
    var socket = new net.Socket();
    const ipAddress = this.config.get("PTOUCH_ITEM_LABEL_PRINTER_IP");

    return new Promise((resolve, reject) => {
      socket.on("error", (err) => {
        socket.destroy();
        reject(err);
      });

      socket.connect(9100, ipAddress, function () {
        socket.write(data, function (err) {
          if (err) {
            socket.destroy();
            return reject(err);
          }
          console.log(`Item label printed for ${itemId}`);
          socket.destroy();
          resolve();
        });
      });
    });
  }
}
