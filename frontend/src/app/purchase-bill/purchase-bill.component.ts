import { Component, OnInit } from '@angular/core';
import { PurchaseService } from '../services/purchase.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-bill',
  templateUrl: './purchase-bill.component.html',
  styleUrls: ['./purchase-bill.component.css']
})
export class PurchaseBillComponent implements OnInit {
  locations: any[] = [];
  items: any[] = [];
  userEmail = '';

  form = {
    item: '',
    batch: '',
    standardCost: 0,
    standardPrice: 0,
    quantity: 0,
    discount: 0
  };

  calculated = {
    margin: 0,
    totalCost: 0,
    totalSelling: 0
  };

  showAutocomplete = false;
  filteredItems: string[] = [];
  allItems = ['Mango', 'Apple', 'Banana', 'Orange', 'Grapes', 'Kiwi', 'Strawberry'];

  constructor(
    private purchaseService: PurchaseService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userEmail = sessionStorage.getItem('userEmail') || '';
    this.loadLocations();
    this.loadItems();
  }

  loadLocations(): void {
    this.purchaseService.getLocations().subscribe({
      next: (res) => this.locations = res
    });
  }

  loadItems(): void {
    this.purchaseService.getItems().subscribe({
      next: (res) => this.items = res
    });
  }

  get totalQuantity(): number {
    return this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  filterItems(): void {
    const val = this.form.item.toLowerCase();
    if (val) {
      this.filteredItems = this.allItems.filter(i => i.toLowerCase().includes(val));
    } else {
      this.filteredItems = [...this.allItems];
    }
    this.showAutocomplete = true;
  }

  onBlur(): void {
    // Delay hiding to allow click on autocomplete item to register first
    setTimeout(() => {
      this.showAutocomplete = false;
    }, 150);
  }

  selectItem(item: string): void {
    this.form.item = item;
    this.showAutocomplete = false;
    this.calculate();
  }

  calculate(): void {
    const cost = Number(this.form.standardCost) || 0;
    const price = Number(this.form.standardPrice) || 0;
    const qty = Number(this.form.quantity) || 0;
    const disc = Number(this.form.discount) || 0;

    // Margin = Standard Price - Standard Cost
    this.calculated.margin = price - cost;
    // Total Cost = (Standard Cost × Quantity) – Discount%
    this.calculated.totalCost = (cost * qty) - (cost * qty * disc / 100);
    // Total Selling = Standard Price × Quantity
    this.calculated.totalSelling = price * qty;
  }

  isFormValid(): boolean {
    return this.form.item !== '' &&
           this.form.batch !== '' &&
           Number(this.form.quantity) > 0;
  }

  addItem(): void {
    if (!this.isFormValid()) return;

    const item = {
      item: this.form.item,
      batch: this.form.batch,
      standardCost: Number(this.form.standardCost) || 0,
      standardPrice: Number(this.form.standardPrice) || 0,
      quantity: Number(this.form.quantity) || 0,
      discount: Number(this.form.discount) || 0,
      totalCost: this.calculated.totalCost,
      totalSelling: this.calculated.totalSelling
    };

    this.purchaseService.addItem(item).subscribe({
      next: (res) => {
        if (res.success) {
          this.items.push(res.item);
          this.resetForm();
        }
      },
      error: (err) => console.error('Error adding item', err)
    });
  }

  resetForm(): void {
    this.form = { item: '', batch: '', standardCost: 0, standardPrice: 0, quantity: 0, discount: 0 };
    this.calculated = { margin: 0, totalCost: 0, totalSelling: 0 };
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
