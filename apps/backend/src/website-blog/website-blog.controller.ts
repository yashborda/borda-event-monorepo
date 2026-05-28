import { Controller, Get, Param, Query } from '@nestjs/common';
import { WebsiteBlogService } from './website-blog.service.js';

@Controller('website/blog')
export class WebsiteBlogController {
  constructor(private readonly websiteBlogService: WebsiteBlogService) {}

  @Get()
  getBlogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('tagSlug') tagSlug?: string,
    @Query('authorSlug') authorSlug?: string,
  ) {
    return this.websiteBlogService.getBlogs(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      search,
      categorySlug,
      tagSlug,
      authorSlug,
    );
  }

  // Static route must come before /:slug
  @Get('slugs')
  getSlugsForStaticParams() {
    return this.websiteBlogService.getSlugsForStaticParams();
  }

  @Get('categories')
  getCategories() {
    return this.websiteBlogService.getCategories();
  }

  // Static route must come before /categories/:slug
  @Get('categories/slugs')
  getCategorySlugsForStaticParams() {
    return this.websiteBlogService.getCategorySlugsForStaticParams();
  }

  @Get('categories/:slug')
  getCategoryWithBlogs(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.websiteBlogService.getCategoryWithBlogs(
      slug,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':slug')
  getBlogBySlug(@Param('slug') slug: string) {
    return this.websiteBlogService.getBlogBySlug(slug);
  }

  // Static route must come before /authors/:slug
  @Get('authors/slugs')
  getAuthorSlugsForStaticParams() {
    return this.websiteBlogService.getAuthorSlugsForStaticParams();
  }

  @Get('authors/:slug')
  getAuthorWithBlogs(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.websiteBlogService.getAuthorWithBlogs(
      slug,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 9,
    );
  }

  // Static route must come before /tags/:slug
  @Get('tags/slugs')
  getTagSlugsForStaticParams() {
    return this.websiteBlogService.getTagSlugsForStaticParams();
  }

  @Get('tags/:slug')
  getTagWithBlogs(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.websiteBlogService.getTagWithBlogs(
      slug,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 9,
    );
  }
}
