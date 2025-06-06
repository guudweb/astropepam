// Gestor de selectores con lazy loading y optimización de rendimiento
export class LazySelectManager {
  private static instance: LazySelectManager;
  private usersCache: any[] | null = null;
  private activeView: 'mobile' | 'desktop' = 'mobile';
  private populatedViews = new Set<string>();
  private intersectionObserver?: IntersectionObserver;

  private constructor() {
    this.detectActiveView();
    this.setupViewportObserver();
    this.setupIntersectionObserver();
  }

  static getInstance(): LazySelectManager {
    if (!LazySelectManager.instance) {
      LazySelectManager.instance = new LazySelectManager();
    }
    return LazySelectManager.instance;
  }

  private detectActiveView(): void {
    this.activeView = window.innerWidth < 1024 ? 'mobile' : 'desktop';
  }

  private setupViewportObserver(): void {
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newView = window.innerWidth < 1024 ? 'mobile' : 'desktop';
        if (newView !== this.activeView) {
          this.activeView = newView;
          this.switchView();
        }
      }, 150);
    });
  }

  private setupIntersectionObserver(): void {
    // Solo poblar selectores cuando son visibles
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const container = entry.target as HTMLElement;
            const viewType = container.classList.contains('lg:hidden') ? 'mobile' : 'desktop';
            this.populateViewIfNeeded(viewType);
          }
        });
      },
      { rootMargin: '50px' }
    );

    // Observar contenedores de vistas
    document.querySelectorAll('[class*="hidden"], [class*="block"]').forEach(container => {
      if (container.querySelector('.user-select')) {
        this.intersectionObserver?.observe(container);
      }
    });
  }

  private async populateViewIfNeeded(viewType: 'mobile' | 'desktop'): Promise<void> {
    if (this.populatedViews.has(viewType)) {
      return;
    }

    if (!this.usersCache) {
      await this.loadUsers();
    }

    const selector = viewType === 'mobile' 
      ? '.block.lg\\:hidden .user-select'
      : '.hidden.lg\\:block .user-select';

    this.populateSelects(document.querySelectorAll(selector));
    this.populatedViews.add(viewType);
    console.log(`Vista ${viewType} poblada lazy`);
  }

  private async loadUsers(): Promise<void> {
    try {
      const response = await fetch('/api/getUsersForProgram.json?activeOnly=true');
      if (response.ok) {
        const { data } = await response.json();
        this.usersCache = data;
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.usersCache = [];
    }
  }

  private populateSelects(selects: NodeListOf<Element>): void {
    if (!this.usersCache) return;

    selects.forEach(select => {
      const selectElement = select as HTMLSelectElement;
      const day = selectElement.dataset.day;
      const turno = selectElement.dataset.turno;

      // Filtrar usuarios disponibles
      const availableUsers = this.usersCache!.filter(user => {
        if (!user.disponibilidad) return false;
        
        try {
          const disponibilidad = typeof user.disponibilidad === "string"
            ? JSON.parse(user.disponibilidad)
            : user.disponibilidad;
            
          return disponibilidad[day!] && disponibilidad[day!].includes(turno);
        } catch {
          return false;
        }
      });

      this.populateSelect(selectElement, availableUsers);
    });
  }

  private populateSelect(select: HTMLSelectElement, users: any[]): void {
    // Limpiar y poblar
    select.innerHTML = `
      <option value=""></option>
      <option value="--separator--" disabled>Seleccionar usuario...</option>
    `;
    
    users.forEach(user => {
      if (!user.nombre || !user.userName) return;
      
      let displayName = user.nombre;
      
      // Agregar badges de privilegios
      if (user.privilegios && Array.isArray(user.privilegios)) {
        const isCapitan = user.privilegios.some(p => p && p.toLowerCase() === 'capitan');
        const otherPrivileges = user.privilegios
          .filter(p => p && p.toLowerCase() !== 'capitan')
          .map(p => p.charAt(0).toUpperCase())
          .join("");
        
        if (isCapitan) displayName = `[C] ${user.nombre}`;
        if (otherPrivileges) displayName += ` [${otherPrivileges}]`;
      }
      
      // Indicadores de estado
      let statusIcon = user.canParticipate === false ? ' 🚫' : 
                      user.validationMessage ? ' ⚠️' : 
                      user.participation_rules?.length > 0 ? ' ⚠️' : ' ✅';
      
      const option = document.createElement('option');
      option.value = user.userName;
      option.textContent = displayName + statusIcon;
      option.dataset.congregacionId = user.congregacion?.id || '';
      option.dataset.participationRules = JSON.stringify(user.participation_rules || []);
      option.disabled = user.canParticipate === false;
      
      select.appendChild(option);
    });
    
    // Opción de añadir usuario
    const addOption = document.createElement('option');
    addOption.value = 'add';
    addOption.textContent = 'Añadir usuario';
    select.appendChild(addOption);
  }

  public async switchView(): Promise<void> {
    // Poblar vista activa si es necesario
    await this.populateViewIfNeeded(this.activeView);
    
    // Sincronizar valores entre vistas
    this.syncViewValues();
  }

  private syncViewValues(): void {
    const sourceSelects = document.querySelectorAll(
      this.activeView === 'mobile' 
        ? '.block.lg\\:hidden .user-select'
        : '.hidden.lg\\:block .user-select'
    );

    sourceSelects.forEach(sourceSelect => {
      const select = sourceSelect as HTMLSelectElement;
      const day = select.dataset.day;
      const turno = select.dataset.turno;
      const index = select.dataset.index;
      const value = select.value;

      if (!value) return;

      // Encontrar selector correspondiente en la otra vista
      const targetSelector = this.activeView === 'mobile'
        ? `.hidden.lg\\:block .user-select[data-day="${day}"][data-turno="${turno}"][data-index="${index}"]`
        : `.block.lg\\:hidden .user-select[data-day="${day}"][data-turno="${turno}"][data-index="${index}"]`;

      const targetSelect = document.querySelector(targetSelector) as HTMLSelectElement;
      if (targetSelect && targetSelect.value !== value) {
        targetSelect.value = value;
      }
    });
  }

  public getActiveViewSelects(): NodeListOf<HTMLSelectElement> {
    const selector = this.activeView === 'mobile' 
      ? '.block.lg\\:hidden .user-select'
      : '.hidden.lg\\:block .user-select';
    
    return document.querySelectorAll(selector);
  }

  public clearCache(): void {
    this.usersCache = null;
    this.populatedViews.clear();
  }

  public destroy(): void {
    this.intersectionObserver?.disconnect();
    this.clearCache();
  }
}

// Función helper para integración con código existente
export const lazySelectManager = LazySelectManager.getInstance();