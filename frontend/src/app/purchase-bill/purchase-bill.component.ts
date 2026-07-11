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
    standardCost: null as number | null,
    standardPrice: null as number | null,
    quantity: null as number | null,
    discount: null as number | null
  };

  calculated = {
    margin: 0,
    totalCost: 0,
    totalSelling: 0
  };

  showAutocomplete = false;

  formTouched: Record<string, boolean> = {
    item: false,
    batch: false,
    standardCost: false,
    standardPrice: false,
    quantity: false,
    discount: false
  };

  formErrors: Record<string, string> = {
    item: '',
    batch: '',
    standardCost: '',
    standardPrice: '',
    quantity: '',
    discount: ''
  };
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

  markTouched(field: string): void {
    this.formTouched[field] = true;
    this.validate();
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

  validate(): void {
    const itemVal = this.form.item.trim();
    const batchVal = this.form.batch.trim();
    const cost = Number(this.form.standardCost);
    const price = Number(this.form.standardPrice);
    const qty = Number(this.form.quantity);
    const disc = Number(this.form.discount);

    // Item validation
    if (!itemVal) {
      this.formErrors['item'] = 'Item is required.';
    } else if (!this.allItems.includes(itemVal)) {
      this.formErrors['item'] = 'Please select a valid item from the list.';
    } else {
      this.formErrors['item'] = '';
    }

    // Batch validation
    if (!batchVal) {
      this.formErrors['batch'] = 'Batch is required.';
    } else {
      this.formErrors['batch'] = '';
    }

    // Standard Cost validation
    if (cost <= 0) {
      this.formErrors['standardCost'] = 'Standard Cost must be greater than 0.';
    } else {
      this.formErrors['standardCost'] = '';
    }

    // Standard Price validation
    if (price <= 0) {
      this.formErrors['standardPrice'] = 'Standard Price must be greater than 0.';
    } else {
      this.formErrors['standardPrice'] = '';
    }

    // Quantity validation
    if (qty <= 0) {
      this.formErrors['quantity'] = 'Quantity must be greater than 0.';
    } else if (!Number.isInteger(qty)) {
      this.formErrors['quantity'] = 'Quantity must be a whole number.';
    } else {
      this.formErrors['quantity'] = '';
    }

    // Discount validation
    if (disc < 0) {
      this.formErrors['discount'] = 'Discount cannot be negative.';
    } else if (disc > 100) {
      this.formErrors['discount'] = 'Discount cannot exceed 100%.';
    } else {
      this.formErrors['discount'] = '';
    }
  }

  isFormValid(): boolean {
    this.validate();
    return this.form.item.trim() !== '' &&
           this.allItems.includes(this.form.item.trim()) &&
           this.form.batch.trim() !== '' &&
           Number(this.form.standardCost) > 0 &&
           Number(this.form.standardPrice) > 0 &&
           Number(this.form.quantity) > 0 &&
           Number.isInteger(Number(this.form.quantity)) &&
           Number(this.form.discount) >= 0 &&
           Number(this.form.discount) <= 100;
  }

  addItem(): void {
    // Mark all fields as touched
    Object.keys(this.formTouched).forEach(key => this.formTouched[key] = true);
    this.validate();

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
    this.form = { item: '', batch: '', standardCost: null, standardPrice: null, quantity: null, discount: null };
    this.calculated = { margin: 0, totalCost: 0, totalSelling: 0 };
    // Reset validation state so errors don't show until user interacts again
    Object.keys(this.formTouched).forEach(key => this.formTouched[key] = false);
    Object.keys(this.formErrors).forEach(key => this.formErrors[key] = '');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
