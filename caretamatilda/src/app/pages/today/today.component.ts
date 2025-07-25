import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";


interface ExecucaoTarefa {
  id: string;             // UUID da execução
  idTarefa: string;       // Referência à tarefa original
  dataExecucao: string;   // 'YYYY-MM-DD'
}


@Component({
  selector: 'app-today',
  imports: [CommonModule, RouterModule, FormsModule, DragDropModule],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss']
})
export class TodayComponent {
  tarefas: {
    id: string;
    icone: string;
    texto: string;
    descricao: string;
    grupo: string;
    feito: boolean;
    editando: boolean;
  }[] = [];
  execucoes: ExecucaoTarefa[] = [];


  emojiOptions = ['📧', '💻', '🧘‍♂️', '📝', '📊', '🛒', '📞', '🎓', '📁', '🔔'];
  novaTarefa: string = '';
  iconePadrao: string = '📝';
  grupoSelecionado: string = 'Pessoal';
  grupoDestacado: string | null = null;
  gruposDisponiveis: string[] = ['Pessoal', 'Trabalho', 'Estudos'];
  


  textoOriginal: string = '';
  iconeOriginal: string = '';

  descricaoModalAberta = false;
  descricaoTemporaria = '';
  tarefaDescricaoId: string | null = null;

  gruposVisiveis: { [grupo: string]: boolean } = {};

  dataSelecionada: string = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  

 ngOnInit(): void {
  const tarefasSalvas = localStorage.getItem('minhasTarefas');
  this.tarefas = tarefasSalvas ? JSON.parse(tarefasSalvas) : [];

  // Reconstruir gruposDisponiveis a partir das tarefas
  this.gruposDisponiveis = [...new Set(this.tarefas.map(t => t.grupo))];

  // Inicializar visibilidade de grupos
  this.gruposDisponiveis.forEach(grupo => {
    if (!(grupo in this.gruposVisiveis)) {
      this.gruposVisiveis[grupo] = true;
    }
  });

  const execucoesSalvas = localStorage.getItem('execucoesTarefas');
this.execucoes = execucoesSalvas ? JSON.parse(execucoesSalvas) : [];

const data = this.dataSelecionada;
this.tarefas.forEach(t => {
  const foiConcluidaHoje = this.execucoes.some(e => e.idTarefa === t.id && e.dataExecucao === data);
  t.feito = foiConcluidaHoje;
});


}





  get grupos(): string[] {
  return [...new Set(this.gruposDisponiveis)];
}

  
  adicionarTarefa(): void {
  if (this.novaTarefa.trim()) {
    // Verifica se o grupo é novo
    if (!this.gruposDisponiveis.includes(this.grupoSelecionado)) {
      this.gruposDisponiveis.push(this.grupoSelecionado);
      this.gruposVisiveis[this.grupoSelecionado] = true;
    }

    const nova = {
      id: Date.now().toString(),
      icone: this.iconePadrao,
      texto: this.novaTarefa.trim(),
      descricao: '',
      grupo: this.grupoSelecionado,
      feito: false,
      editando: false
    };

    this.tarefas.push(nova);
    this.novaTarefa = '';
    this.salvarTarefas();
  }
}

  salvarTarefas(): void {
    localStorage.setItem('minhasTarefas', JSON.stringify(this.tarefas));
  }

  excluirTarefaPorId(id: string): void {
    this.tarefas = this.tarefas.filter(t => t.id !== id);
    this.salvarTarefas();
  }

  editarTarefaPorId(id: string): void {
    const tarefa = this.tarefas.find(t => t.id === id);
    if (tarefa) {
      this.textoOriginal = tarefa.texto;
      this.iconeOriginal = tarefa.icone;
      tarefa.editando = true;
    }
  }

salvarEdicaoEnterPorId(id: string): void {
  const tarefa = this.tarefas.find(t => t.id === id);
  console.log(tarefa)
  if (tarefa) {
    tarefa.texto = tarefa.texto.trim(); // garante que salva o texto atualizado
    tarefa.editando = false;
    this.salvarTarefas();
  }
}


  cancelarEdicaoBlurPorId(id: string): void {
    const tarefa = this.tarefas.find(t => t.id === id);
    if (tarefa) {
      tarefa.texto = this.textoOriginal;
      tarefa.icone = this.iconeOriginal;
      tarefa.editando = false;
    }
  }

  selecionarEmojiPorId(id: string, evento: Event): void {
    const tarefa = this.tarefas.find(t => t.id === id);
    if (tarefa) {
      const selectElement = evento.target as HTMLSelectElement;
      tarefa.icone = selectElement.value;
      tarefa.editando = false;
      this.salvarTarefas();
    }
  }

 

  abrirModalDescricao(id: string): void {
    const tarefa = this.tarefas.find(t => t.id === id);
    if (tarefa) {
      this.tarefaDescricaoId = id;
      this.descricaoTemporaria = tarefa.descricao || '';
      this.descricaoModalAberta = true;
    }
  }

  salvarDescricaoModal(): void {
    if (this.tarefaDescricaoId !== null) {
      const tarefa = this.tarefas.find(t => t.id === this.tarefaDescricaoId);
      if (tarefa) {
        tarefa.descricao = this.descricaoTemporaria.trim();
        this.salvarTarefas();
      }
    }
    this.fecharModalDescricao();
  }

  fecharModalDescricao(): void {
    this.descricaoModalAberta = false;
    this.tarefaDescricaoId = null;
    this.descricaoTemporaria = '';
  }

  getTarefasDoGrupo(grupo: string): typeof this.tarefas {
    return this.tarefas.filter(t => t.grupo === grupo);
  }

  getTotalDoGrupo(grupo: string): number {
    return this.tarefas.filter(t => t.grupo === grupo).length;
  }

  getConcluidasDoGrupo(grupo: string): number {
    return this.tarefas.filter(t => t.grupo === grupo && t.feito).length;
  }

  getProgressoDoGrupo(grupo: string): number {
    const total = this.getTotalDoGrupo(grupo);
    const concluidas = this.getConcluidasDoGrupo(grupo);
    return total > 0 ? Math.round((concluidas / total) * 100) : 0;
  }

  toggleGrupo(grupo: string): void {
    this.gruposVisiveis[grupo] = !this.gruposVisiveis[grupo];
  }

 aoSoltar(event: CdkDragDrop<any[]>, grupoAlvo: string): void {
  const tarefaArrastada = event.item.data;
  const id = tarefaArrastada.id;

  if (event.previousContainer === event.container) {
    const tarefasDoGrupo = this.tarefas.filter(t => t.grupo === grupoAlvo);
    const idsOrdenados = [...tarefasDoGrupo];
    moveItemInArray(idsOrdenados, event.previousIndex, event.currentIndex);

    // Atualiza a ordem no this.tarefas mantendo os demais grupos
    this.tarefas = [
      ...this.tarefas.filter(t => t.grupo !== grupoAlvo),
      ...idsOrdenados
    ];
  } else {
    const tarefa = this.tarefas.find(t => t.id === id);
    if (tarefa) tarefa.grupo = grupoAlvo;
  }

  this.salvarTarefas();
}


 // Ao adicionar um grupo
adicionarGrupo(): void {
  const nomeGrupo = prompt('Nome do novo grupo:')?.trim();
  if (nomeGrupo && !this.gruposDisponiveis.includes(nomeGrupo)) {
    this.gruposDisponiveis.push(nomeGrupo);
    this.gruposVisiveis[nomeGrupo] = true;
  }
}


excluirGrupo(nome: string): void {
  const temTarefas = this.tarefas.some(t => t.grupo === nome);
  if (temTarefas) {
    alert('Este grupo possui tarefas. Remova ou mova antes de excluir.');
    return;
  }

  this.gruposDisponiveis = this.gruposDisponiveis.filter(g => g !== nome);
  delete this.gruposVisiveis[nome];
}


atualizarTexto(id: string, novoTexto: string): void {
  const tarefa = this.tarefas.find(t => t.id === id);
  if (tarefa) {
    tarefa.texto = novoTexto;
  }
}

finalizarEdicao(id: string): void {
  const tarefa = this.tarefas.find(t => t.id === id);
  if (tarefa) {
    tarefa.editando = false;
    tarefa.texto = tarefa.texto.trim();
    this.salvarTarefas();
  }
}

cancelarEdicao(id: string): void {
  const tarefa = this.tarefas.find(t => t.id === id);
  if (tarefa) {
    tarefa.texto = this.textoOriginal;
    tarefa.icone = this.iconeOriginal;
    tarefa.editando = false;
  }
}

alternarStatusPorId(id: string): void {
  const tarefa = this.tarefas.find(t => t.id === id);
  if (tarefa) {
    tarefa.feito = !tarefa.feito;

   const data = this.dataSelecionada;


    if (tarefa.feito) {
      // Marcar como feito → adicionar execução
      const execucao: ExecucaoTarefa = {
        id: crypto.randomUUID(),
        idTarefa: id,
        dataExecucao: data
      };
      this.execucoes.push(execucao);
    } else {
      // Desfazer → remover execução de hoje
      this.execucoes = this.execucoes.filter(e => !(e.idTarefa === id && e.dataExecucao === data));
    }

    this.salvarTarefas();
    this.salvarExecucoes();
  }
}


salvarExecucoes(): void {
  localStorage.setItem('execucoesTarefas', JSON.stringify(this.execucoes));
}

aplicarResetPorData(): void {
  const data = this.dataSelecionada;
  this.tarefas.forEach(t => {
    const feitaNaData = this.execucoes.some(e => e.idTarefa === t.id && e.dataExecucao === data);
    t.feito = feitaNaData;
  });
}





}