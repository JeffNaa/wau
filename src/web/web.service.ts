import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { I18nService } from '../i18n/i18n.service';
import {
  BUILT_IN_WIDGETS,
  DEFAULT_SITE_THEME,
  DEFAULT_SITE_HEADER,
  DEFAULT_SITE_FOOTER,
  DEFAULT_NAVIGATION,
  DEFAULT_HOME_PAGE,
} from './web.seed';
import { CreatePageDto, UpdatePageDto, CreateNavigationDto, UpdateNavigationDto, UpdateConfigDto } from './dto';

@Injectable()
export class WebService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  // ─── SiteConfig ───

  async getAllConfigs() {
    const configs = await this.prisma.client.siteConfig.findMany();
    return configs.reduce((acc, c) => {
      acc[c.key] = c.value;
      return acc;
    }, {} as Record<string, any>);
  }

  async getConfig(key: string) {
    return this.prisma.client.siteConfig.findUnique({ where: { key } });
  }

  async updateConfig(key: string, dto: UpdateConfigDto) {
    return this.prisma.client.siteConfig.upsert({
      where: { key },
      update: { value: dto.value },
      create: { key, value: dto.value },
    });
  }

  // ─── Page ───

  async getAllPages() {
    return this.prisma.client.page.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getPageBySlug(slug: string) {
    return this.prisma.client.page.findUnique({ where: { slug } });
  }

  async getHomePage() {
    return this.prisma.client.page.findFirst({ where: { isHome: true } });
  }

  async createPage(dto: CreatePageDto) {
    const exists = await this.prisma.client.page.findUnique({ where: { slug: dto.slug } });
    if (exists) {
      throw new ConflictException(this.i18n.t('errors.web.page_already_exists', { slug: dto.slug }));
    }

    if (dto.isHome) {
      await this.clearOtherHome();
    }
    return this.prisma.client.page.create({ data: dto });
  }

  async updatePage(slug: string, dto: UpdatePageDto) {
    const existing = await this.prisma.client.page.findUnique({ where: { slug } });
    if (!existing) {
      throw new NotFoundException(this.i18n.t('errors.web.page_not_found', { slug }));
    }

    // Check for slug collision when changing slug
    const newSlug = (dto as any).slug;
    if (newSlug && newSlug !== slug) {
      const taken = await this.prisma.client.page.findUnique({ where: { slug: newSlug } });
      if (taken) {
        throw new ConflictException(this.i18n.t('errors.web.page_already_exists', { slug: newSlug }));
      }
    }

    if (dto.isHome) {
      await this.clearOtherHome();
    }

    return this.prisma.client.page.update({
      where: { slug },
      data: dto,
    });
  }

  async deletePage(slug: string) {
    const existing = await this.prisma.client.page.findUnique({ where: { slug } });
    if (!existing) {
      throw new NotFoundException(this.i18n.t('errors.web.page_not_found', { slug }));
    }
    return this.prisma.client.page.delete({ where: { slug } });
  }

  async setHomePage(slug: string) {
    const page = await this.prisma.client.page.findUnique({ where: { slug } });
    if (!page) {
      throw new NotFoundException(this.i18n.t('errors.web.page_not_found', { slug }));
    }

    await this.clearOtherHome();
    return this.prisma.client.page.update({
      where: { slug },
      data: { isHome: true },
    });
  }

  private async clearOtherHome() {
    await this.prisma.client.page.updateMany({
      where: { isHome: true },
      data: { isHome: false },
    });
  }

  // ─── Navigation ───

  async getNavigation(position?: string) {
    const where = position ? { position } : {};
    const items = await this.prisma.client.navigation.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { children: true },
    });

    return items.filter((item) => !item.parentId);
  }

  async createNavigation(dto: CreateNavigationDto) {
    if (dto.parentId) {
      const parent = await this.prisma.client.navigation.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundException(this.i18n.t('errors.web.navigation_parent_not_found', { id: dto.parentId }));
      }
    }
    return this.prisma.client.navigation.create({ data: dto });
  }

  async updateNavigation(id: string, dto: UpdateNavigationDto) {
    const existing = await this.prisma.client.navigation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(this.i18n.t('errors.web.navigation_not_found', { id }));
    }

    if (dto.parentId) {
      const parent = await this.prisma.client.navigation.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundException(this.i18n.t('errors.web.navigation_parent_not_found', { id: dto.parentId }));
      }
    }

    return this.prisma.client.navigation.update({ where: { id }, data: dto });
  }

  async deleteNavigation(id: string) {
    const existing = await this.prisma.client.navigation.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(this.i18n.t('errors.web.navigation_not_found', { id }));
    }
    return this.prisma.client.navigation.delete({ where: { id } });
  }

  async reorderNavigation(orders: { id: string; order: number }[]) {
    const updates = orders.map((item) =>
      this.prisma.client.navigation.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );
    await this.prisma.client.$transaction(updates);
    return { success: true, count: orders.length };
  }

  // ─── WidgetRegistry ───

  async getAllWidgets() {
    return this.prisma.client.widgetRegistry.findMany({
      orderBy: { category: 'asc' },
    });
  }

  async getWidgetByType(type: string) {
    return this.prisma.client.widgetRegistry.findUnique({ where: { type } });
  }

  // ─── Seed ───

  async seedBuiltInWidgets() {
    for (const widget of BUILT_IN_WIDGETS) {
      await this.prisma.client.widgetRegistry.upsert({
        where: { type: widget.type },
        update: {
          name: widget.name,
          category: widget.category,
          configSchema: widget.configSchema,
          icon: widget.icon,
          isBuiltIn: true,
        },
        create: {
          type: widget.type,
          name: widget.name,
          category: widget.category,
          configSchema: widget.configSchema,
          icon: widget.icon,
          isBuiltIn: true,
        },
      });
    }
    console.log(`Seeded ${BUILT_IN_WIDGETS.length} built-in widgets`);

    // Seed site theme config
    await this.prisma.client.siteConfig.upsert({
      where: { key: 'site_theme' },
      update: {},
      create: { key: 'site_theme', value: DEFAULT_SITE_THEME },
    });

    // Seed site header config
    await this.prisma.client.siteConfig.upsert({
      where: { key: 'site_header' },
      update: {},
      create: { key: 'site_header', value: DEFAULT_SITE_HEADER },
    });

    // Seed site footer config
    await this.prisma.client.siteConfig.upsert({
      where: { key: 'site_footer' },
      update: {},
      create: { key: 'site_footer', value: DEFAULT_SITE_FOOTER },
    });

    // Seed default navigation
    for (const nav of DEFAULT_NAVIGATION) {
      const existing = await this.prisma.client.navigation.findFirst({
        where: { label: nav.label, position: nav.position },
      });
      if (!existing) {
        await this.prisma.client.navigation.create({ data: nav });
      }
    }

    // Seed default home page
    const homeExists = await this.prisma.client.page.findUnique({
      where: { slug: DEFAULT_HOME_PAGE.slug },
    });
    if (!homeExists) {
      await this.prisma.client.page.create({
        data: {
          slug: DEFAULT_HOME_PAGE.slug,
          title: DEFAULT_HOME_PAGE.title,
          layout: DEFAULT_HOME_PAGE.layout,
          meta: DEFAULT_HOME_PAGE.meta,
          isHome: DEFAULT_HOME_PAGE.isHome,
          status: DEFAULT_HOME_PAGE.status as any,
        },
      });
    }

    console.log('Seeded site configs, navigation, and home page');
  }
}
