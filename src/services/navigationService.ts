import { taskService, internService, certificateService } from './backendless';

export interface NavigationCounts {
  tasks: number;
  interns: number;
  certificates: number;
}

export interface VisitedPages {
  [key: string]: boolean;
}

class NavigationService {
  private visitedPagesKey = 'ltg_visited_pages';

  async getNavigationCounts(): Promise<NavigationCounts> {
    try {
      const [tasks, interns, certificates] = await Promise.all([
        taskService.getAllTasks(),
        internService.getAllInterns(),
        certificateService.getAllCertificates()
      ]);

      return {
        tasks: tasks.length,
        interns: interns.length,
        certificates: certificates.length
      };
    } catch (error) {
      console.error('Error fetching navigation counts:', error);
      return {
        tasks: 0,
        interns: 0,
        certificates: 0
      };
    }
  }

  getVisitedPages(): VisitedPages {
    try {
      const visited = localStorage.getItem(this.visitedPagesKey);
      return visited ? JSON.parse(visited) : {};
    } catch (error) {
      console.error('Error getting visited pages:', error);
      return {};
    }
  }

  markPageAsVisited(path: string): void {
    try {
      const visited = this.getVisitedPages();
      visited[path] = true;
      localStorage.setItem(this.visitedPagesKey, JSON.stringify(visited));
    } catch (error) {
      console.error('Error marking page as visited:', error);
    }
  }

  isPageVisited(path: string): boolean {
    const visited = this.getVisitedPages();
    return visited[path] || false;
  }

  clearVisitedPages(): void {
    try {
      localStorage.removeItem(this.visitedPagesKey);
    } catch (error) {
      console.error('Error clearing visited pages:', error);
    }
  }
}

export const navigationService = new NavigationService();