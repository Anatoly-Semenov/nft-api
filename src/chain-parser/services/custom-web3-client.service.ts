import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');

const TIMEOUT = 2 * 60 * 1000;

@Injectable()
export class CustomWeb3ClientService {
  private web3: any;
  private nodeUrl: string;

  constructor(private httpService: HttpService) {
    this.web3 = new Web3();
  }

  public setNodeUrl(url) {
    this.nodeUrl = url;
  }

  public getTransactionReceipt(trxHash: string): any {
    const data = {
      method: 'eth_getTransactionReceipt',
      params: [trxHash],
      id: new Date().getTime(),
      jsonrpc: '2.0',
    };

    return firstValueFrom(
      this.httpService.post(this.nodeUrl, data, { timeout: TIMEOUT }),
    ).then((resp) => {
      return resp?.data?.result || {};
    });
  }

  public getInternalTransactions(trxHash: string): any {
    const data = {
      method: 'trace_replayTransaction',
      params: [trxHash, ['trace']],
      id: new Date().getTime(),
      jsonrpc: '2.0',
    };

    return firstValueFrom(
      this.httpService.post(this.nodeUrl, data, { timeout: TIMEOUT }),
    ).then((resp) => {
      return resp?.data?.result?.trace || {};
    });
  }

  public ethGetLogs(address, from, to, topics) {
    const fromBlock = this.web3.utils.numberToHex(from);
    const toBlock = this.web3.utils.numberToHex(to);

    const data = {
      method: 'eth_getLogs',
      params: [
        {
          address,
          fromBlock,
          toBlock,
          topics,
        },
      ],
      id: new Date().getTime(),
      jsonrpc: '2.0',
    };

    return firstValueFrom(
      this.httpService.post(this.nodeUrl, data, { timeout: TIMEOUT }),
    ).then((resp) => {
      return resp?.data?.result || [];
    });
  }

  public hexToNumber(hex) {
    return this.web3.utils.hexToNumber(hex);
  }

  public encodeParameter(type, value) {
    return this.web3.eth.abi.encodeParameter(type, value);
  }

  public decodeParameter(type, value) {
    return this.web3.eth.abi.decodeParameter(type, value);
  }
}
