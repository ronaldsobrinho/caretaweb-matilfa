import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';





@Component({
  selector: 'app-today',
  imports:[CommonModule, RouterModule, FormsModule,DragDropModule],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss']
})
export class TodayComponent {
    tarefas: { icone: string; texto: string; feito: boolean  , editando: boolean }[] = [];
    emojiOptions = [
  '📧', '💻', '🧘‍♂️', '📝', '📊', '🛒', '📞', '🎓', '📁', '🔔'
];

  novaTarefa: string = '';
  iconePadrao: string = '📝'; // Ícone default para novas tarefas
  textoOriginal: string = '';
  iconeOriginal: string = '';

  ngOnInit(): void {
    const tarefasSalvas = localStorage.getItem('minhasTarefas');
    this.tarefas = tarefasSalvas ? JSON.parse(tarefasSalvas) : [];
  }

  alternarStatus(index: number): void {
    this.tarefas[index].feito = !this.tarefas[index].feito;
    this.salvarTarefas();
  }

  adicionarTarefa(): void {
    if (this.novaTarefa.trim()) {
      this.tarefas.push({
        icone: this.iconePadrao,
        texto: this.novaTarefa.trim(),
        feito: false,
        editando : false
      });
      this.novaTarefa = '';
      this.salvarTarefas();
    }
  }

  excluirTarefa(index: number): void {
    this.tarefas.splice(index, 1);
    this.salvarTarefas();
  }

  salvarTarefas(): void {
    localStorage.setItem('minhasTarefas', JSON.stringify(this.tarefas));
  }

reordenar(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.tarefas, event.previousIndex, event.currentIndex);
    this.salvarTarefas();
  }


finalizarEdicao(index: number): void {
  this.tarefas[index].editando = false;
  this.salvarTarefas();
}


salvarEdicaoEnter(event: KeyboardEvent, index: number): void {
  if (event.key == 'Enter') {
    this.tarefas[index].editando = false;
    this.salvarTarefas();
  } else if (event.key === 'Escape') {
    this.tarefas[index].texto = this.textoOriginal; // restaura texto
    this.tarefas[index].editando = false;
  }
}

cancelarEdicaoBlur(index: number): void {
  this.tarefas[index].editando = false;
    this.salvarTarefas();
}

editarTarefa(index: number): void {
  this.textoOriginal = this.tarefas[index].texto;
  this.iconeOriginal = this.tarefas[index].icone;
  this.tarefas[index].editando = true;
}

cancelarEdicao(index: number): void {
  this.tarefas[index].texto = this.textoOriginal;
  this.tarefas[index].icone = this.iconeOriginal;
  this.tarefas[index].editando = false;
}

selecionarEmoji(index: number, evento: Event): void {
  const selectElement = evento.target as HTMLSelectElement;
  const novoEmoji = selectElement.value;

  this.tarefas[index].icone = novoEmoji;
  this.tarefas[index].editando = false;
  this.salvarTarefas();
}




}



