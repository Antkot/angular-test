import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database } from '../../services/database';
import { MedicalRecord } from '../../models/app.models';

@Component({
  selector: 'app-senior-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './senior-dashboard.html',
  styleUrls: ['./senior-dashboard.scss']
})
export class SeniorDashboard implements OnInit {

  public records: MedicalRecord[] = [];
  public isLoading: boolean = true;

  constructor(private database: Database) { }

  ngOnInit(): void {
    console.log('2. ngOnInit wywołane, wysyłam zapytanie do serwisu...');

    this.database.getMedicalRecordsByUserId('u2').subscribe({
      next: (data: MedicalRecord[]) => {
        console.log('3. SUKCES! Dane pobrane:', data);
        this.records = data;
        this.isLoading = false; // <-- To wyłącza stan ładowania
      },
      error: (err: any) => {
        console.error('Błąd pobierania danych:', err);
        this.isLoading = false;
      }
    });
  }
}
