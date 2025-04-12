import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';

interface Person {
  id: number;
  fullname: string;
  age: number;
  tutorname: string;
  phone: string | null;
  selected: boolean;
}

@Component({
  selector: 'app-yunta',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  template: `
    <div class="yunta-container">
      <!-- Activity Form -->
      <form [formGroup]="activityForm" class="activity-form">
        <h2>REGISTRO CLUB YUNTA</h2>
        <div class="form-group">
          <label for="activityName">Nombre de la actividad:</label>
          <input 
            id="activityName"
            type="text" 
            formControlName="activityName" 
            placeholder="Enter activity name" 
          />
          <div *ngIf="activityForm.get('activityName')?.invalid && activityForm.get('activityName')?.touched" class="error">
            El nombre de la actividad es requerido
          </div>
        </div>
        
        <div class="form-group">
          <label for="activityDate">Fecha:</label>
          <input 
            id="activityDate"
            type="date" 
            formControlName="activityDate" 
          />
          <div *ngIf="activityForm.get('activityDate')?.invalid && activityForm.get('activityDate')?.touched" class="error">
            La fecha es requerida
          </div>
        </div>
      </form>

      <!-- Search and Table Section -->
      <div class="table-container">
        <div class="table-actions">
          <input
            type="text"
            placeholder="Buscar por nombre o tutor..."
            [(ngModel)]="searchTerm"
            (input)="filterData()"
            class="search-input"
          />
          
          <button (click)="openAddPersonModal()" class="btn btn-add">Agregar Nuevo</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  [checked]="allSelected" 
                  (change)="toggleAll($event)" 
                  id="selectAll"
                />
                <label for="selectAll" class="checkbox-label">Seleccionar Todos</label>
              </th>
              <th>Nombre completo</th>
              <th>Edad</th>
              <th>Tutor</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredData; let i = index" [class.selected]="item.selected">
              <td>
                <input
                  type="checkbox"
                  [id]="'person-' + item.id"
                  [checked]="item.selected"
                  (change)="toggleSelection(item)"
                />
                <label [for]="'person-' + item.id" class="checkbox-label"></label>
              </td>
              <td>{{ item.fullname }}</td>
              <td>{{ item.age }}</td>
              <td>{{ item.tutorname }}</td>
              <td>{{ item.phone || 'N/A' }}</td>
              <td class="action-buttons">
                <button (click)="editItem(item)" class="btn btn-edit">Editar</button>
                <button (click)="deleteItem(item)" class="btn btn-delete">Borrar</button>
              </td>
            </tr>
            <tr *ngIf="filteredData.length === 0">
              <td colspan="6" class="no-data">No existen registros</td>
            </tr>
          </tbody>
        </table>
        
        <div class="form-actions">
          <button 
            (click)="registerActivity()" 
            class="btn btn-primary"
            [disabled]="activityForm.invalid || getSelectedPeople().length === 0">
            Registrar Actividad
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for adding/editing a person -->
    <div *ngIf="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isEditMode ? 'Edit Person' : 'Add New Person' }}</h2>
        <form [formGroup]="personForm" (ngSubmit)="savePerson()">
          <div class="form-group">
            <label for="fullname">Nombre Completo:</label>
            <input type="text" id="fullname" formControlName="fullname" />
            <div *ngIf="personForm.get('fullname')?.invalid && personForm.get('fullname')?.touched" class="error">
              El nombre completo es necesario
            </div>
          </div>
          
          <div class="form-group">
            <label for="age">Edad:</label>
            <input type="number" id="age" formControlName="age" min="0" />
            <div *ngIf="personForm.get('age')?.invalid && personForm.get('age')?.touched" class="error">
              La edad debe ser mayor a cero
            </div>
          </div>
          
          <div class="form-group">
            <label for="tutorname">Tutor:</label>
            <input type="text" id="tutorname" formControlName="tutorname" />
            <div *ngIf="personForm.get('tutorname')?.invalid && personForm.get('tutorname')?.touched" class="error">
              El nombre del tutor es necesario
            </div>
          </div>
          
          <div class="form-group">
            <label for="phone">Teléfono (opcional):</label>
            <input type="tel" id="phone" formControlName="phone" />
            <div *ngIf="personForm.get('phone')?.invalid && personForm.get('phone')?.touched" class="error">
              Porfavor ingrese un número de teléfono válido
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary" [disabled]="personForm.invalid">
              Guardar
            </button>
            <button type="button" (click)="closeModal()" class="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

  <div *ngIf="showDeleteModal" class="modal-overlay">
    <div class="modal-content">
      <h2>Confirmar Eliminación</h2>
      <p>Estás seguro de eliminar a esta persona?</p>
      <div class="modal-actions">
        <button (click)="confirmDelete()" class="btn btn-primary">Si</button>
        <button (click)="closeDeleteModal()" class="btn btn-secondary">No</button>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./yunta.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YuntaComponent implements OnInit {
  activityForm!: FormGroup;
  personForm!: FormGroup;
  showModal = false;
  showDeleteModal = false;
  isEditMode = false;
  currentPersonId: number | null = null;
  searchTerm = '';
  allSelected = false;

  // Next ID for new people
  private nextId = 1;

  people: Person[] = [];
  filteredData: Person[] = [];

  constructor(private fb: FormBuilder) {
    this.initForms();
  }

  ngOnInit(): void {
    // Initialize with sample data
    const sampleData: Person[] = [
      { id: this.nextId++, fullname: 'John Doe', age: 25, tutorname: 'Jane Smith', phone: '1234567890', selected: false },
      { id: this.nextId++, fullname: 'Alice Johnson', age: 30, tutorname: 'Bob Brown', phone: null, selected: false },
      { id: this.nextId++, fullname: 'Michael Green', age: 22, tutorname: 'Sarah White', phone: '9876543210', selected: false },
    ];

    this.people = sampleData;
    this.filteredData = [...this.people];
    this.updatePeopleFormArray();
  }

  private initForms(): void {
    // Initialize activity form without complex typing
    this.activityForm = this.fb.group({
      activityName: ['', [Validators.required]],
      activityDate: ['', [Validators.required]],
      people: this.fb.array([])
    });

    // Initialize person form
    this.personForm = this.fb.group({
      fullname: ['', [Validators.required]],
      age: [0, [Validators.min(0)]],
      tutorname: [''],
      phone: ['', [Validators.pattern(/^\d{8}$|^$/)]], // Optional but must be valid if provided
    });
  }

  get peopleFormArray(): FormArray {
    return this.activityForm.get('people') as FormArray;
  }

  private updatePeopleFormArray(): void {
    // Clear the array
    while (this.peopleFormArray.length) {
      this.peopleFormArray.removeAt(0);
    }

    // Add the selected people
    this.getSelectedPeople().forEach(person => {
      this.peopleFormArray.push(this.createPersonFormGroup(person));
    });
  }

  private createPersonFormGroup(person: Person): FormGroup {
    return this.fb.group({
      id: [person.id],
      fullname: [person.fullname, [Validators.required]],
      age: [person.age, [Validators.required, Validators.min(0)]],
      tutorname: [person.tutorname, [Validators.required]],
      phone: [person.phone],
      selected: [person.selected]
    });
  }

  filterData(): void {
    if (!this.searchTerm) {
      this.filteredData = [...this.people];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredData = this.people.filter(item =>
      item.fullname.toLowerCase().includes(term) ||
      item.tutorname.toLowerCase().includes(term)
    );
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.people.forEach(person => person.selected = checked);
    this.filteredData.forEach(person => person.selected = checked);
    this.allSelected = checked;
    this.updatePeopleFormArray();
  }

  toggleSelection(person: Person): void {
    person.selected = !person.selected;
    this.checkAllSelected();
    this.updatePeopleFormArray();
  }

  checkAllSelected(): void {
    this.allSelected = this.people.length > 0 && this.people.every(person => person.selected);
  }

  getSelectedPeople(): Person[] {
    return this.people.filter(person => person.selected);
  }

  openAddPersonModal(): void {
    this.isEditMode = false;
    this.currentPersonId = null;
    this.personForm.reset({
      fullname: '',
      age: 0,
      tutorname: '',
      phone: '',
    });
    this.showModal = true;
  }

  editItem(person: Person): void {
    this.isEditMode = true;
    this.currentPersonId = person.id;
    this.personForm.reset({
      fullname: person.fullname,
      age: person.age,
      tutorname: person.tutorname,
      phone: person.phone || '',
    });
    this.showModal = true;
  }

  deleteItem(person: Person): void {
    this.currentPersonId = person.id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.currentPersonId !== null) {
      this.people = this.people.filter(p => p.id !== this.currentPersonId);
      this.filterData();
      this.updatePeopleFormArray();
      this.checkAllSelected();
      this.closeDeleteModal();
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.currentPersonId = null;
  }

  closeModal(): void {
    this.showModal = false;
  }

  savePerson(): void {
    if (this.personForm.invalid) return;

    const formValue = this.personForm.value;

    if (this.isEditMode && this.currentPersonId !== null) {
      // Update existing person
      const index = this.people.findIndex(p => p.id === this.currentPersonId);
      if (index !== -1) {
        const updatedPerson: Person = {
          ...this.people[index],
          fullname: formValue.fullname || '',
          age: Number(formValue.age) || 0,
          tutorname: formValue.tutorname || '',
          phone: formValue.phone || null,
        };
        this.people[index] = updatedPerson;
      }
    } else {
      // Add new person
      const newPerson: Person = {
        id: this.nextId++,
        fullname: formValue.fullname || '',
        age: Number(formValue.age) || 0,
        tutorname: formValue.tutorname || '',
        phone: formValue.phone || null,
        selected: false
      };
      this.people.push(newPerson);
    }

    this.filterData();
    this.closeModal();
  }

  registerActivity(): void {
    if (this.activityForm.invalid) return;

    // Update the people array in the form before submitting
    this.updatePeopleFormArray();

    const activityData = {
      activityName: this.activityForm.get('activityName')?.value,
      activityDate: this.activityForm.get('activityDate')?.value,
      registrationDate: new Date(),
      totalParticipants: this.getSelectedPeople().length,
      participants: this.getSelectedPeople()
    };

    console.log('Activity Registered:', activityData);
    // Here you would send the data to your backend service

    // Show confirmation to user
    alert(`Activity "${activityData.activityName}" registered successfully with ${activityData.totalParticipants} participants!`);
  }
}