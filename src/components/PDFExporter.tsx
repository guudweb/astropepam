import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { User } from '@/interfaces/user.interface';

interface PDFExporterProps {
  users: User[];
  currentFilters?: {
    searchTerm?: string;
    day?: string;
    turn?: string;
    isActive?: boolean | null;
    privileges?: string[];
    congregations?: string[];
    serviceLink?: boolean | null;
  };
}

export const PDFExporter: React.FC<PDFExporterProps> = ({ users, currentFilters }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const getPrivilegeText = (privilegios: string[] | null): string => {
    if (!privilegios || privilegios.length === 0) return 'Ninguno';
    
    return privilegios.map(p => {
      const privilege = p.toLowerCase();
      switch (privilege) {
        case 'capitan': return 'Capitan';
        case 'precursor': return 'Precursor';
        case 'anciano': return 'Anciano';
        case 'siervo': return 'Siervo';
        case 'especial': return 'Especial';
        default: return p;
      }
    }).join(', ');
  };

  const getParticipationRulesText = (rules: any[] | null): string => {
    if (!rules || rules.length === 0) return 'Sin restricciones';
    
    return rules.map(rule => {
      switch (rule.type) {
        case 'max_per_month':
          return `Máx ${rule.value}/mes`;
        case 'max_per_week':
          return `Máx ${rule.value}/semana`;
        case 'specific_weeks':
          const weeks = Array.isArray(rule.value) ? rule.value : [rule.value];
          return `Semanas: ${weeks.join(',')}`;
        case 'alternating_weeks':
          return 'Alternadas';
        default:
          return rule.description || '';
      }
    }).join(', ');
  };

  const getFilterDescription = (): string => {
    if (!currentFilters) return 'Todos los usuarios';
    
    const descriptions = [];
    
    if (currentFilters.searchTerm) {
      descriptions.push(`Búsqueda: "${currentFilters.searchTerm}"`);
    }
    
    if (currentFilters.isActive !== null && currentFilters.isActive !== undefined) {
      descriptions.push(currentFilters.isActive ? 'Solo activos' : 'Solo inactivos');
    }
    
    if (currentFilters.serviceLink !== null && currentFilters.serviceLink !== undefined) {
      descriptions.push(currentFilters.serviceLink ? 'Servicio habilitado' : 'Servicio deshabilitado');
    }
    
    if (currentFilters.privileges && currentFilters.privileges.length > 0) {
      descriptions.push(`Privilegios: ${currentFilters.privileges.join(', ')}`);
    }
    
    if (currentFilters.congregations && currentFilters.congregations.length > 0) {
      descriptions.push(`${currentFilters.congregations.length} congregación(es) seleccionada(s)`);
    }
    
    if (currentFilters.day && currentFilters.turn) {
      descriptions.push(`Disponibles: ${currentFilters.day} - ${currentFilters.turn}`);
    } else if (currentFilters.day) {
      descriptions.push(`Disponibles: ${currentFilters.day}`);
    } else if (currentFilters.turn) {
      descriptions.push(`Disponibles: ${currentFilters.turn}`);
    }
    
    return descriptions.length > 0 ? descriptions.join(' | ') : 'Todos los usuarios';
  };

  const generatePDF = async (reportType: 'current' | 'all' | 'active' | 'inactive' | 'privileged') => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      
      // Configuración del documento
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      
      // Línea decorativa superior
      doc.setDrawColor(0, 150, 200);
      doc.setLineWidth(1);
      doc.line(margin, 15, pageWidth - margin, 15);
      
      // Encabezado
      doc.setFontSize(20);
      doc.setTextColor(0, 150, 200); // Color azul
      doc.text('PPAM Malabo - Lista de Voluntarios', margin, 25);
      
      // Línea decorativa debajo del título
      doc.setLineWidth(0.5);
      doc.line(margin, 28, pageWidth - margin, 28);
      
      // Fecha de generación
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, pageWidth - margin - 60, 35);
      
      // Descripción del filtro
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      let filterText = '';
      
      switch (reportType) {
        case 'current':
          filterText = `Filtros aplicados: ${getFilterDescription()}`;
          break;
        case 'all':
          filterText = 'Reporte: Todos los usuarios registrados';
          break;
        case 'active':
          filterText = 'Reporte: Solo usuarios activos';
          break;
        case 'inactive':
          filterText = 'Reporte: Solo usuarios inactivos';
          break;
        case 'privileged':
          filterText = 'Reporte: Solo usuarios con privilegios';
          break;
      }
      
      doc.text(filterText, margin, 45);
      
      // Filtrar usuarios según el tipo de reporte
      let filteredUsers = [...users];
      
      if (reportType === 'current') {
        // Para usuarios filtrados, obtener TODOS los resultados que coinciden con los filtros
        try {
          const url = new URL('/api/getAllFilteredUsersForPDF.json', window.location.origin);
          
          if (currentFilters?.searchTerm) {
            url.searchParams.append('q', currentFilters.searchTerm);
          }
          if (currentFilters?.day) {
            url.searchParams.append('day', currentFilters.day);
          }
          if (currentFilters?.turn) {
            url.searchParams.append('turn', currentFilters.turn);
          }
          if (currentFilters?.isActive !== null && currentFilters?.isActive !== undefined) {
            url.searchParams.append('isActive', currentFilters.isActive.toString());
          }
          if (currentFilters?.privileges && currentFilters.privileges.length > 0) {
            url.searchParams.append('privileges', currentFilters.privileges.join(','));
          }
          if (currentFilters?.congregations && currentFilters.congregations.length > 0) {
            url.searchParams.append('congregations', currentFilters.congregations.join(','));
          }
          if (currentFilters?.serviceLink !== null && currentFilters?.serviceLink !== undefined) {
            url.searchParams.append('serviceLink', currentFilters.serviceLink.toString());
          }

          const response = await fetch(url.toString());
          if (response.ok) {
            const data = await response.json();
            filteredUsers = data.data || [];
          } else {
            console.warn('No se pudieron obtener usuarios filtrados desde la API, usando usuarios actuales');
            filteredUsers = users;
          }
        } catch (error) {
          console.error('Error obteniendo usuarios filtrados para PDF:', error);
          filteredUsers = users;
        }
      } else {
        // Obtener usuarios desde la API para reportes completos
        try {
          const response = await fetch(`/api/getAllUsersForPDF.json?type=${reportType}`);
          if (response.ok) {
            const data = await response.json();
            filteredUsers = data.data || [];
          } else {
            console.warn('No se pudieron obtener usuarios desde la API, usando usuarios actuales');
            // Fallback: usar filtros locales
            switch (reportType) {
              case 'active':
                filteredUsers = users.filter(user => user.isActive);
                break;
              case 'inactive':
                filteredUsers = users.filter(user => !user.isActive);
                break;
              case 'privileged':
                filteredUsers = users.filter(user => 
                  user.privilegios && Array.isArray(user.privilegios) && user.privilegios.length > 0
                );
                break;
              case 'all':
              default:
                filteredUsers = users;
                break;
            }
          }
        } catch (error) {
          console.error('Error obteniendo usuarios para PDF:', error);
          // Fallback: usar usuarios actuales con filtros locales
          switch (reportType) {
            case 'active':
              filteredUsers = users.filter(user => user.isActive);
              break;
            case 'inactive':
              filteredUsers = users.filter(user => !user.isActive);
              break;
            case 'privileged':
              filteredUsers = users.filter(user => 
                user.privilegios && Array.isArray(user.privilegios) && user.privilegios.length > 0
              );
              break;
            case 'all':
            default:
              filteredUsers = users;
              break;
          }
        }
      }
      
      // Ordenar usuarios alfabéticamente por nombre
      const sortedUsers = [...filteredUsers].sort((a, b) => 
        (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
      );
      
      // Preparar datos para la tabla
      const tableData = sortedUsers.map(user => [
        user.nombre || 'Sin nombre',
        user.congregacion?.nombre || 'Sin congregación',
        user.telefono?.toString() || 'Sin teléfono',
        user.isActive ? 'Si' : 'X',
        user.service_link ? 'Si' : 'X',
        getPrivilegeText(user.privilegios),
        getParticipationRulesText(user.participation_rules)
      ]);
      
      // Configuración de la tabla
      autoTable(doc, {
        head: [['Nombre', 'Congregación', 'Teléfono', 'Estado', 'Servicio', 'Privilegios', 'Condiciones']],
        body: tableData,
        startY: 55,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 150, 200],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 32 }, // Nombre
          1: { cellWidth: 28 }, // Congregación
          2: { cellWidth: 22 }, // Teléfono
          3: { cellWidth: 18 }, // Estado
          4: { cellWidth: 20 }, // Servicio
          5: { cellWidth: 32 }, // Privilegios
          6: { cellWidth: 35 }, // Condiciones
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        didDrawCell: (data) => {
          // Colorear celdas de estado (columna 3)
          if (data.column.index === 3 && data.section === 'body') {
            const cellText = data.cell.text[0] || '';
            if (cellText === 'Si') {
              data.cell.styles.fillColor = [220, 252, 231]; // Verde claro
              data.cell.styles.textColor = [22, 101, 52]; // Verde oscuro
              data.cell.styles.fontStyle = 'bold';
            } else if (cellText === 'X') {
              data.cell.styles.fillColor = [254, 226, 226]; // Rojo claro
              data.cell.styles.textColor = [185, 28, 28]; // Rojo oscuro
              data.cell.styles.fontStyle = 'bold';
            }
          }
          
          // Colorear celdas de servicio de enlace (columna 4)
          if (data.column.index === 4 && data.section === 'body') {
            const cellText = data.cell.text[0] || '';
            if (cellText === 'Si') {
              data.cell.styles.fillColor = [220, 252, 231]; // Verde claro
              data.cell.styles.textColor = [22, 101, 52]; // Verde oscuro
              data.cell.styles.fontStyle = 'bold';
            } else if (cellText === 'X') {
              data.cell.styles.fillColor = [254, 226, 226]; // Rojo claro
              data.cell.styles.textColor = [185, 28, 28]; // Rojo oscuro
              data.cell.styles.fontStyle = 'bold';
            }
          }
          
          // Estilo especial para privilegios (columna 5)
          if (data.column.index === 5 && data.section === 'body') {
            if (data.cell.text[0] !== 'Ninguno') {
              data.cell.styles.fillColor = [219, 234, 254]; // Azul claro
              data.cell.styles.textColor = [29, 78, 216]; // Azul oscuro
              data.cell.styles.fontStyle = 'bold';
            }
          }
          
          // Estilo para condiciones de participación (columna 6)
          if (data.column.index === 6 && data.section === 'body') {
            if (data.cell.text[0] !== 'Sin restricciones') {
              data.cell.styles.fillColor = [254, 243, 199]; // Amarillo claro
              data.cell.styles.textColor = [146, 64, 14]; // Amarillo oscuro
              data.cell.styles.fontSize = 7;
            }
          }
        }
      });
      
      // Pie de página con estadísticas
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      
      // Línea separadora
      doc.setDrawColor(0, 150, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, finalY + 10, pageWidth - margin, finalY + 10);
      
      // Título de estadísticas
      doc.setFontSize(12);
      doc.setTextColor(0, 150, 200);
      doc.text('Resumen del Reporte', margin, finalY + 20);
      
      // Estadísticas en formato de tabla compacta
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      const activeUsers = sortedUsers.filter(u => u.isActive).length;
      const inactiveUsers = sortedUsers.filter(u => !u.isActive).length;
      const privilegedUsers = sortedUsers.filter(u => u.privilegios && u.privilegios.length > 0).length;
      const serviceEnabled = sortedUsers.filter(u => u.service_link).length;
      const captains = sortedUsers.filter(u => u.privilegios && u.privilegios.some(p => p.toLowerCase() === 'capitan')).length;
      const pioneers = sortedUsers.filter(u => u.privilegios && u.privilegios.some(p => p.toLowerCase() === 'precursor')).length;
      const elders = sortedUsers.filter(u => u.privilegios && u.privilegios.some(p => p.toLowerCase() === 'anciano')).length;
      const servants = sortedUsers.filter(u => u.privilegios && u.privilegios.some(p => p.toLowerCase() === 'siervo')).length;
      const special = sortedUsers.filter(u => u.privilegios && u.privilegios.some(p => p.toLowerCase() === 'especial')).length;
      
      const statsData = [
        ['Total de usuarios:', sortedUsers.length.toString()],
        ['Usuarios activos:', `${activeUsers} (${Math.round((activeUsers/sortedUsers.length)*100)}%)`],
        ['Usuarios inactivos:', `${inactiveUsers} (${Math.round((inactiveUsers/sortedUsers.length)*100)}%)`],
        ['Servicio de enlace:', `${serviceEnabled} habilitados`],
        ['Con privilegios:', privilegedUsers.toString()],
        ['Capitanes:', captains.toString()],
        ['Precursores:', pioneers.toString()],
        ['Ancianos:', elders.toString()],
        ['Siervos:', servants.toString()],
        ['Especiales:', special.toString()]
      ];
      
      // Crear tabla de estadísticas en dos columnas
      const leftStats = statsData.slice(0, 5);
      const rightStats = statsData.slice(5);
      
      // Tabla izquierda
      autoTable(doc, {
        body: leftStats,
        startY: finalY + 25,
        margin: { left: margin, right: pageWidth/2 + 10 },
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 35, halign: 'right' },
        },
        theme: 'plain'
      });
      
      // Tabla derecha
      if (rightStats.length > 0) {
        autoTable(doc, {
          body: rightStats,
          startY: finalY + 25,
          margin: { left: pageWidth/2 + 10, right: margin },
          styles: {
            fontSize: 9,
            cellPadding: 2,
          },
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 25, halign: 'right' },
          },
          theme: 'plain'
        });
      }
      
      // Información adicional en el pie
      const footerY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('PPAM Malabo', margin, footerY);
      doc.text(`Página 1 de 1`, pageWidth - margin - 30, footerY);
      
      // Generar nombre del archivo
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `PPAM_Voluntarios_${reportType}_${timestamp}.pdf`;
      
      // Descargar el PDF
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    } finally {
      setIsExporting(false);
      setShowOptions(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {isExporting ? (
          <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        {isExporting ? 'Generando...' : 'Exportar PDF'}
      </button>

      {showOptions && (
        <div className="absolute left-0 right-0 sm:right-0 sm:left-auto mt-2 w-auto min-w-[320px] sm:w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Tipo de reporte</h4>
            
            <div className="space-y-2">
              <button
                onClick={() => generatePDF('current')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-blue-600">📊</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">Usuarios filtrados</div>
                  <div className="text-xs text-gray-500 truncate">Todos los resultados con filtros actuales</div>
                </div>
              </button>
              
              <button
                onClick={() => generatePDF('all')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-gray-600">👥</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">Todos los usuarios</div>
                  <div className="text-xs text-gray-500 truncate">Lista completa sin filtros</div>
                </div>
              </button>
              
              <button
                onClick={() => generatePDF('active')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-green-600">✅</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">Solo activos</div>
                  <div className="text-xs text-gray-500 truncate">Usuarios disponibles para participar</div>
                </div>
              </button>
              
              <button
                onClick={() => generatePDF('inactive')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-red-600">❌</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">Solo inactivos</div>
                  <div className="text-xs text-gray-500 truncate">Usuarios no disponibles</div>
                </div>
              </button>
              
              <button
                onClick={() => generatePDF('privileged')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <span className="text-purple-600">⭐</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">Con privilegios</div>
                  <div className="text-xs text-gray-500 truncate">Precursores, capitanes, etc.</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
};