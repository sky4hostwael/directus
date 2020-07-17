/**
 * Sanitize query parameters.
 * This ensures that query params are formatted and ready to go for the services.
 */

import { RequestHandler } from 'express';
import { Query, Sort, Filter } from '../types/query';
import { Meta } from '../types/meta';
import logger from '../logger';

const sanitizeQuery: RequestHandler = (req, res, next) => {
	if (!req.query) return;

	const query: Query = {
		fields: sanitizeFields(req.query.fields) || ['*'],
	};

	if (req.query.limit) {
		query.limit = sanitizeLimit(req.query.limit);
	}

	if (req.query.sort) {
		query.sort = sanitizeSort(req.query.sort);
	}

	if (req.query.filter) {
		query.filter = sanitizeFilter(req.query.filter);
	}

	if (req.query.limit == '-1') {
		delete query.limit;
	}

	if (req.query.offset) {
		query.offset = sanitizeOffset(req.query.offset);
	}

	if (req.query.page) {
		query.page = sanitizePage(req.query.page);
	}

	if (req.query.single) {
		query.single = sanitizeSingle(req.query.single);
	}

	if (req.query.meta) {
		query.meta = sanitizeMeta(req.query.meta);
	}

	if (req.query.search && typeof req.query.search === 'string') {
		query.search = req.query.search;
	}

	if (req.permissions) {
		query.filter = {
			...(query.filter || {}),
			...(req.permissions.permissions || {}),
		};
	}

	req.sanitizedQuery = query;
	return next();
};

export default sanitizeQuery;

function sanitizeFields(rawFields: any) {
	if (!rawFields) return;

	let fields: string[] = [];

	if (typeof rawFields === 'string') fields = rawFields.split(',');
	else if (Array.isArray(rawFields)) fields = rawFields as string[];

	return fields;
}

function sanitizeSort(rawSort: any) {
	let fields: string[] = [];

	if (typeof rawSort === 'string') fields = rawSort.split(',');
	else if (Array.isArray(rawSort)) fields = rawSort as string[];

	return fields.map((field) => {
		const order = field.startsWith('-') ? 'desc' : 'asc';
		const column = field.startsWith('-') ? field.substring(1) : field;
		return { column, order } as Sort;
	});
}

function sanitizeFilter(rawFilter: any) {
	let filters: Filter = rawFilter;

	if (typeof rawFilter === 'string') {
		try {
			filters = JSON.parse(rawFilter);
		} catch {
			logger.warn('Invalid value passed for filter query parameter.');
		}
	}

	/**
	 * @todo
	 * validate filter syntax?
	 */

	return filters;
}

function sanitizeLimit(rawLimit: any) {
	if (!rawLimit) return null;
	return Number(rawLimit);
}

function sanitizeOffset(rawOffset: any) {
	return Number(rawOffset);
}

function sanitizePage(rawPage: any) {
	return Number(rawPage);
}

function sanitizeSingle(rawSingle: any) {
	return true;
}

function sanitizeMeta(rawMeta: any) {
	if (rawMeta === '*') {
		return Object.values(Meta);
	}

	if (rawMeta.includes(',')) {
		return rawMeta.split(',');
	}

	if (Array.isArray(rawMeta)) {
		return rawMeta;
	}
}
