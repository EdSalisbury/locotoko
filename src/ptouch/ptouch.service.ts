import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
var Ptouch = require("node-ptouch");
var net = require("net");

@Injectable()
export class PtouchService extends Ptouch {
  constructor(private config: ConfigService) {
    super(config.get("PTOUCH_ITEM_LABEL_TEMPLATE_ID"), { copies: 1 });
  }

  printItemLabel(url: string, itemId: string, itemName: string) {
    this.insertData("url", url);
    this.insertData("itemId", itemId);
    this.insertData("itemName", itemName);

    var data = this.generate();
    var socket = new net.Socket();

    const ipAddress = this.config.get("PTOUCH_ITEM_LABEL_PRINTER_IP");
    socket.connect(9100, ipAddress, function (err) {
      if (err) {
        return console.log(err);
      }
      socket.write(data, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(`Item label printed for ${itemId}`);
        socket.destroy();
      });
    });
  }
}
