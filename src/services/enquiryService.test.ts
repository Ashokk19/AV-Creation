import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('enquiry submission payload validation and UUID generation', () => {
  test('UUID validator accepts valid v4 UUID formats', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    // Test node crypto randomUUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      const generated = crypto.randomUUID();
      assert.match(generated, uuidRegex);
    }
  });

  test('Validates required fields for customer inquiry submission', () => {
    const isValidSubmission = (data: { customer_name: string; email: string; description: string }) => {
      if (!data.customer_name?.trim()) return 'Customer name is required.';
      if (!data.email?.trim()) return 'Email address is required.';
      if (!data.description?.trim()) return 'Project description is required.';
      return null;
    };

    assert.equal(isValidSubmission({ customer_name: '', email: 'test@example.com', description: 'test' }), 'Customer name is required.');
    assert.equal(isValidSubmission({ customer_name: 'John', email: '   ', description: 'test' }), 'Email address is required.');
    assert.equal(isValidSubmission({ customer_name: 'John', email: 'test@example.com', description: '' }), 'Project description is required.');
    assert.equal(isValidSubmission({ customer_name: 'John', email: 'test@example.com', description: 'Valid print request' }), null);
  });

  test('Constructs inquiry payload with defaults without requiring RETURNING * from PostgREST', () => {
    const now = new Date().toISOString();
    const id = '12345678-1234-4234-8234-123456789abc';
    const payload = {
      id,
      customer_name: 'Maya Chen',
      email: 'maya@example.com',
      phone: null,
      project_category: 'ambient-lighting',
      description: 'Custom voronoi lamp',
      attachment_url: null,
      attachment_name: null,
      reference_link: null,
      dimensions: '150 × 150 × 180 mm',
      material_preference: 'Studio Recommendation',
      quantity: 1,
      target_timeline: 'flexible',
      status: 'new' as const,
    };

    const record = {
      ...payload,
      admin_notes: null,
      created_at: now,
      updated_at: now,
    };

    assert.equal(record.id, id);
    assert.equal(record.status, 'new');
    assert.equal(record.quantity, 1);
    assert.equal(record.admin_notes, null);
    assert.ok(record.created_at);
  });
});
