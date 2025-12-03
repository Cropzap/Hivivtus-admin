import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Paper, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Select, MenuItem, Checkbox, FormControlLabel,
    InputLabel, FormControl, IconButton, Grid // Ensure Grid is imported
} from '@mui/material';
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Edit, Trash2, X, Tag, Zap, Clock, DollarSign, Users, CheckCircle, Ban,
} from 'lucide-react';
import axios from 'axios';

// --- CONFIGURATION ---
const API_URL = import.meta.env.VITE_API_URL || '/api/'; 
const PROMO_API = `${API_URL}promocodes`;

const initialFormState = {
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    maxUses: 100,
    perUserLimit: 1, // Already present
    isActive: true,
    expirationDate: '',
    minPurchaseAmount: 0,
};

const STATUS_COLORS = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-red-100 text-red-800",
    Expired: "bg-yellow-100 text-yellow-800",
};

// --- Modal Wrapper (Reused from previous admin component) ---
const ModalWrapper = ({ children, onClose, maxWidth = 'max-w-xl' }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-gray-900 bg-opacity-75 backdrop-blur-sm">
        <motion.div
            className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6 md:p-8 relative`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        >
            <IconButton onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                <X size={24} />
            </IconButton>
            {children}
        </motion.div>
    </div>
);

// --- Create/Edit Modal Component ---
const PromoCodeFormModal = ({ promoCode, onClose, onSave }) => {
    const [form, setForm] = useState(promoCode || initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEdit = !!promoCode;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' || name === 'discountValue' || name === 'maxUses' || name === 'perUserLimit' || name === 'minPurchaseAmount' ? parseFloat(value) : value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave(form, isEdit);
            onClose();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save promo code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose} maxWidth="max-w-md">
            <h3 className="text-3xl font-bold text-gray-900 border-b-2 pb-4 mb-6 flex items-center">
                <Tag size={28} className="mr-3 text-blue-500" /> {isEdit ? 'Edit Promo Code' : 'Create New Code'}
            </h3>
            {error && <Alert severity="error" className="mb-4">{error}</Alert>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                    label="Code"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    required
                    fullWidth
                    size="small"
                    InputProps={{ style: { textTransform: 'uppercase' } }}
                />

                <FormControl fullWidth size="small" required>
                    <InputLabel id="discountType-label">Discount Type</InputLabel>
                    <Select
                        labelId="discountType-label"
                        label="Discount Type"
                        name="discountType"
                        value={form.discountType}
                        onChange={handleChange}
                    >
                        <MenuItem value="percentage">Percentage (%)</MenuItem>
                        <MenuItem value="fixed">Fixed Amount (₹)</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label={`Discount Value (${form.discountType === 'percentage' ? '%' : '₹'})`}
                    name="discountValue"
                    type="number"
                    value={form.discountValue}
                    onChange={handleChange}
                    required
                    fullWidth
                    size="small"
                    inputProps={{ min: 0, step: "0.01" }}
                />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            label="Max Total Uses"
                            name="maxUses"
                            type="number"
                            value={form.maxUses}
                            onChange={handleChange}
                            required
                            fullWidth
                            size="small"
                            inputProps={{ min: 1, step: "1" }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        {/* Per User Limit field - Already correctly included */}
                        <TextField
                            label="Per User Limit"
                            name="perUserLimit"
                            type="number"
                            value={form.perUserLimit}
                            onChange={handleChange}
                            required
                            fullWidth
                            size="small"
                            inputProps={{ min: 1, step: "1" }}
                        />
                    </Grid>
                </Grid>

                <TextField
                    label="Min Purchase Amount (₹)"
                    name="minPurchaseAmount"
                    type="number"
                    value={form.minPurchaseAmount}
                    onChange={handleChange}
                    required
                    fullWidth
                    size="small"
                    inputProps={{ min: 0, step: "0.01" }}
                />

                <TextField
                    label="Expiration Date (Optional)"
                    name="expirationDate"
                    type="date"
                    value={form.expirationDate ? new Date(form.expirationDate).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={form.isActive}
                            onChange={handleChange}
                            name="isActive"
                            color="primary"
                        />
                    }
                    label="Active"
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-3 mt-4"
                >
                    {isEdit ? (loading ? 'Saving Changes...' : 'Update Code') : (loading ? 'Creating Code...' : 'Create Code')}
                </Button>
            </form>
        </ModalWrapper>
    );
};

// --- Main Admin Promo Code Component ---
export default function AdminPromoCode() {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ message: '', severity: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingCode, setEditingCode] = useState(null);

    const authToken = localStorage.getItem('authToken');

    const fetchPromoCodes = useCallback(async () => {
        if (!authToken) {
            setError("Authentication required.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(PROMO_API, {
                headers: { 'x-auth-token': authToken },
            });
            setPromoCodes(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch promo codes.');
            setPromoCodes([]);
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        fetchPromoCodes();
    }, [fetchPromoCodes]);

    // --- CRUD Handlers ---

    const handleSave = async (form, isEdit) => {
        const url = isEdit ? `${PROMO_API}/${form._id}` : PROMO_API;
        const method = isEdit ? 'PUT' : 'POST';

        // Sanitization and type conversion
        const payload = {
             ...form,
             // Ensure numerical fields are parsed correctly before sending
             discountValue: parseFloat(form.discountValue),
             maxUses: parseInt(form.maxUses),
             perUserLimit: parseInt(form.perUserLimit), // Ensure perUserLimit is an integer
             minPurchaseAmount: parseFloat(form.minPurchaseAmount),
             // Format date correctly if present (already handled in the modal, but good to ensure)
             expirationDate: form.expirationDate || null,
        };
        
        // Clean up unnecessary fields for creation/update
        if (!isEdit) {
            delete payload._id;
        }
        
        // Ensure currentUses is not manually manipulated if it's meant to be managed by the system
        // The backend should typically handle incrementing this.

        try {
            await axios({
                method: method,
                url: url,
                data: payload,
                headers: { 'x-auth-token': authToken },
            });
            
            setStatusMessage({ message: `Promo code ${isEdit ? 'updated' : 'created'} successfully!`, severity: 'success' });
            fetchPromoCodes();
        } catch (err) {
            throw err; // Re-throw to be caught by the modal form
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promo code? This action cannot be undone.')) return;

        try {
            await axios.delete(`${PROMO_API}/${id}`, {
                headers: { 'x-auth-token': authToken },
            });
            setStatusMessage({ message: 'Promo code deleted.', severity: 'success' });
            fetchPromoCodes();
        } catch (err) {
            setStatusMessage({ message: err.response?.data?.msg || 'Failed to delete promo code.', severity: 'error' });
        }
    };

    // --- Modal Control ---

    const openCreateModal = () => {
        setEditingCode(null);
        setShowModal(true);
    };

    const openEditModal = (code) => {
        // Ensure date is ISO formatted for the input type="date"
        if (code.expirationDate) {
            code.expirationDate = new Date(code.expirationDate).toISOString().split('T')[0];
        }
        setEditingCode(code);
        setShowModal(true);
    };

    // --- UI Helpers ---

    const formatDateTime = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        if (isNaN(date)) return "Invalid Date";
        return date.toLocaleDateString();
    };

    const getStatusInfo = (code) => {
        const isExpired = code.expirationDate && new Date(code.expirationDate) < new Date();
        if (!code.isActive) {
            return { label: 'Inactive', color: STATUS_COLORS.Inactive, icon: <Ban size={16} /> };
        }
        if (isExpired) {
            return { label: 'Expired', color: STATUS_COLORS.Expired, icon: <Clock size={16} /> };
        }
        if (code.currentUses >= code.maxUses) {
             return { label: 'Usage Limit Hit', color: STATUS_COLORS.Inactive, icon: <Zap size={16} /> };
        }
        return { label: 'Active', color: STATUS_COLORS.Active, icon: <CheckCircle size={16} /> };
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 4, my: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                <Typography variant="h4" fontWeight={700} className="text-gray-800 flex items-center">
                    <Tag size={32} className="mr-2 text-blue-600" /> Promo Code Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Plus />}
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-2 px-6 shadow-lg hover:shadow-xl transition-all"
                >
                    Create New Code
                </Button>
            </Box>

            {statusMessage.message && (
                <Alert severity={statusMessage.severity} onClose={() => setStatusMessage({ message: '', severity: '' })} className="mb-4">
                    {statusMessage.message}
                </Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" py={10}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" className="mb-4">{error}</Alert>
            ) : (
                <TableContainer component={Paper} className="rounded-xl shadow-lg border border-gray-200">
                    <Table size="small" className="min-w-full">
                        <TableHead className="bg-gray-100">
                            <TableRow>
                                <TableCell className="font-bold text-gray-700 w-[10%]">Code</TableCell>
                                <TableCell className="font-bold text-gray-700 w-[10%]">Status</TableCell>
                                <TableCell className="font-bold text-gray-700 w-[20%]">Discount</TableCell>
                                <TableCell className="font-bold text-gray-700 w-[15%]">Min Purchase</TableCell>
                                <TableCell className="font-bold text-gray-700 w-[15%]">Usage (Total/User)</TableCell> 
                                <TableCell className="font-bold text-gray-700 w-[15%]">Expires</TableCell>
                                <TableCell className="font-bold text-gray-700 w-[15%] text-center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {promoCodes.map((code) => {
                                const statusInfo = getStatusInfo(code);
                                return (
                                    <TableRow key={code._id} hover>
                                        <TableCell className="font-semibold text-gray-900">{code.code}</TableCell>
                                        <TableCell>
                                            <span className={`px-3 py-1 font-bold text-xs rounded-full flex items-center w-max ${statusInfo.color}`}>
                                                {statusInfo.icon} <span className="ml-1">{statusInfo.label}</span>
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {code.discountType === 'fixed' 
                                                ? `₹${code.discountValue.toFixed(2)} OFF`
                                                : `${code.discountValue}% OFF`}
                                        </TableCell>
                                        <TableCell className="text-sm">₹{code.minPurchaseAmount.toFixed(2)}</TableCell>
                                        <TableCell className="text-sm">
                                            {code.currentUses} / {code.maxUses} total
                                            <span className='block text-xs text-gray-500'>({code.perUserLimit} per user)</span>
                                        </TableCell>
                                        <TableCell className="text-sm">{formatDateTime(code.expirationDate)}</TableCell>
                                        <TableCell className="text-center space-x-1">
                                            <IconButton size="small" color="info" onClick={() => openEditModal(code)} title="Edit Code">
                                                <Edit size={16} />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(code._id)} title="Delete Code">
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <AnimatePresence>
                {showModal && (
                    <PromoCodeFormModal
                        promoCode={editingCode}
                        onClose={() => setShowModal(false)}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </Paper>
    );
}