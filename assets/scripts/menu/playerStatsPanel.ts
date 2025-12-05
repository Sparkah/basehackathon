import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('playerStatsPanel')
export class playerStatsPanel extends Component {
    @property(Node)
    public coinsText: Node = null;

    @property(Node)
    public timeText: Node = null;

    @property(Node)
    public incomeText: Node = null;

    // get data from apiClient class here and update the stats panel
    public updateStats(coins: number, time: number, income: number) {
    }
}

