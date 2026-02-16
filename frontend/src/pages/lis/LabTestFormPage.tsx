import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { labTestService } from '../../services/labTest.service';
import { referenceRangeService } from '../../services/referenceRange.service';
import { Button, Card, Input } from '../../components/ui';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import type { LabTestCategory, SpecimenType, CreateReferenceRangeRequest } from '../../types';
import { LISNav } from './LISNav';

const categories: LabTestCategory[] = [
  'HEMATOLOGY',
  'CHEMISTRY',
  'MICROBIOLOGY',
  'SEROLOGY',
  'IMMUNOLOGY',
  'MOLECULAR',
  'ENDOCRINOLOGY',
  'TOXICOLOGY',
  'URINALYSIS',
  'COAGULATION',
  'HISTOLOGY',
  'CYTOLOGY',
  'OTHER',
];

const specimenTypes: SpecimenType[] = [
  'BLOOD',
  'SERUM',
  'PLASMA',
  'URINE',
  'STOOL',
  'CSF',
  'SPUTUM',
  'SWAB',
  'TISSUE',
  'FLUID',
  'BONE_MARROW',
  'OTHER',
];

const genders = [
  { value: '', label: 'All Genders' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export function LabTestFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'CHEMISTRY' as LabTestCategory,
    description: '',
    specimenType: 'BLOOD' as SpecimenType,
    containerType: '',
    volumeRequired: undefined as number | undefined,
    turnaroundTime: 60,
    requiresFasting: false,
    specialInstructions: '',
  });

  const [referenceRanges, setReferenceRanges] = useState<CreateReferenceRangeRequest[]>([]);

  const { data: testData, isLoading: isLoadingTest } = useQuery({
    queryKey: ['lab-test', id],
    queryFn: () => labTestService.getLabTest(id!),
    enabled: isEditing,
  });

  const { data: rangesData } = useQuery({
    queryKey: ['reference-ranges', id],
    queryFn: () => referenceRangeService.getRangesByTestId(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (testData) {
      setFormData({
        code: testData.code,
        name: testData.name,
        category: testData.category,
        description: testData.description || '',
        specimenType: testData.specimenType,
        containerType: testData.containerType || '',
        volumeRequired: testData.volumeRequired,
        turnaroundTime: testData.turnaroundTime,
        requiresFasting: testData.requiresFasting,
        specialInstructions: testData.specialInstructions || '',
      });
    }
  }, [testData]);

  useEffect(() => {
    if (rangesData) {
      setReferenceRanges(rangesData.map(range => ({
        testId: id!,
        gender: range.gender || undefined,
        ageMin: range.ageMin || undefined,
        ageMax: range.ageMax || undefined,
        lowValue: range.lowValue || undefined,
        highValue: range.highValue || undefined,
        criticalLow: range.criticalLow || undefined,
        criticalHigh: range.criticalHigh || undefined,
        isDefault: range.isDefault,
        referenceText: range.referenceText || undefined,
      })));
    }
  }, [rangesData, id]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (isEditing) {
        return labTestService.updateLabTest(id!, data);
      }
      return labTestService.createLabTest(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-tests'] });
      navigate('/lis/tests');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const addReferenceRange = () => {
    setReferenceRanges([
      ...referenceRanges,
      {
        testId: id || '',
        isDefault: referenceRanges.length === 0,
      },
    ]);
  };

  const updateReferenceRange = (index: number, field: keyof CreateReferenceRangeRequest, value: any) => {
    const updated = [...referenceRanges];
    updated[index] = { ...updated[index], [field]: value };
    setReferenceRanges(updated);
  };

  const removeReferenceRange = (index: number) => {
    setReferenceRanges(referenceRanges.filter((_, i) => i !== index));
  };

  if (isEditing && isLoadingTest) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading test...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/lis/tests')}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Lab Test' : 'New Lab Test'}
        </h1>
      </div>

      <LISNav />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Test Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Code *
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., GLU"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Glucose"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as LabTestCategory })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specimen Type *
              </label>
              <select
                value={formData.specimenType}
                onChange={(e) => setFormData({ ...formData, specimenType: e.target.value as SpecimenType })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {specimenTypes.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Container Type
              </label>
              <Input
                value={formData.containerType}
                onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                placeholder="e.g., Red Top Tube"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume Required (mL)
              </label>
              <Input
                type="number"
                step="0.1"
                value={formData.volumeRequired || ''}
                onChange={(e) => setFormData({ ...formData, volumeRequired: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 2.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Turnaround Time (minutes) *
              </label>
              <Input
                type="number"
                value={formData.turnaroundTime}
                onChange={(e) => setFormData({ ...formData, turnaroundTime: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              placeholder="Brief description of the test..."
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions
            </label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={2}
              placeholder="Any special collection or handling instructions..."
            />
          </div>

          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="requiresFasting"
              checked={formData.requiresFasting}
              onChange={(e) => setFormData({ ...formData, requiresFasting: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="requiresFasting" className="text-sm text-gray-700">
              Requires Fasting
            </label>
          </div>
        </Card>

        {isEditing && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Reference Ranges</h2>
              <Button type="button" variant="secondary" onClick={addReferenceRange}>
                <Plus size={16} className="mr-2" />
                Add Range
              </Button>
            </div>

            {referenceRanges.length === 0 ? (
              <p className="text-gray-500">No reference ranges defined. Add ranges to enable automatic flagging.</p>
            ) : (
              <div className="space-y-4">
                {referenceRanges.map((range, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                        <select
                          value={range.gender || ''}
                          onChange={(e) => updateReferenceRange(index, 'gender', e.target.value || undefined)}
                          className="w-full px-2 py-1 text-sm border rounded"
                        >
                          {genders.map((g) => (
                            <option key={g.value} value={g.value}>{g.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Age Min (months)</label>
                        <Input
                          type="number"
                          value={range.ageMin || ''}
                          onChange={(e) => updateReferenceRange(index, 'ageMin', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Age Max (months)</label>
                        <Input
                          type="number"
                          value={range.ageMax || ''}
                          onChange={(e) => updateReferenceRange(index, 'ageMax', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Low Value</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={range.lowValue || ''}
                          onChange={(e) => updateReferenceRange(index, 'lowValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">High Value</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={range.highValue || ''}
                          onChange={(e) => updateReferenceRange(index, 'highValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Critical Low</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={range.criticalLow || ''}
                          onChange={(e) => updateReferenceRange(index, 'criticalLow', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Critical High</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={range.criticalHigh || ''}
                          onChange={(e) => updateReferenceRange(index, 'criticalHigh', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="text-sm"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeReferenceRange(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/lis/tests')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            <Save size={18} className="mr-2" />
            {mutation.isPending ? 'Saving...' : isEditing ? 'Update Test' : 'Create Test'}
          </Button>
        </div>
      </form>
    </div>
  );
}
