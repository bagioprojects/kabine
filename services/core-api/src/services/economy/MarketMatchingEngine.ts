export interface Order {
  id: string;
  itemId: string;
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
}

export class MarketMatchingEngine {
  public getOrderBookSummary(item: string) {
    return {
      buy: [] as Order[],
      sell: [] as Order[]
    };
  }
}
