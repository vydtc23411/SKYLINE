import { Component } from '@angular/core';
import rewardsData from './rewards-data.json';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-rewards',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './rewards.html',
  styleUrl: './rewards.css',
})
export class Rewards {
  userData: any = rewardsData;
  displayedRanks: any[] = [];

  ngOnInit() {
    this.loadDisplayedRanks();
  }

  loadDisplayedRanks() {
    const current = this.userData.currentRank;
    if (current === 'Đồng') {
      this.displayedRanks = [
        this.userData.ranks['Đồng'],
        this.userData.ranks['Bạc']
      ];
    } else if (current === 'Bạc') {
      this.displayedRanks = [
        this.userData.ranks['Bạc'],
        this.userData.ranks['Vàng']
      ];
    } else {
      this.displayedRanks = [this.userData.ranks['Vàng']];
    }
  }
}

