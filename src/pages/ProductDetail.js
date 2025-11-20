    import React, { useState, useEffect } from 'react';
    import { useParams } from 'react-router-dom';
    import api from '../services/api';

    const ProductDetail = () => {
    const { id } = useParams();  // ID del producto de la URL /product/:id
    const [product, setProduct] = useState(null);
    const [comments, setComments] = useState([]);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [proposedPrice, setProposedPrice] = useState('');
    const [cartQty, setCartQty] = useState(1);  // Qty para carrito
    const [selectedImage, setSelectedImage] = useState(0);  // Para galería
    const [modalOpen, setModalOpen] = useState(false);  // Estado para modal de zoom

    // Estilos inline actualizados: Agregados para modal de zoom (lightbox simple)
    const styles = {
        productDetailContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: '#fff',
        color: '#0f1111',
        },
        productHeader: {
        textAlign: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e0e0e0',
        },
        productTitle: {
        color: '#0f1111',
        fontSize: '2.2em',
        fontWeight: '600',
        margin: '0',
        lineHeight: '1.2',
        },
        productMain: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginBottom: '40px',
        },
        productImages: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        },
        mainImageContainer: {
        width: '100%',
        height: '500px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        position: 'relative',
        },
        mainImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        },
        mainImageHover: {
        transform: 'scale(1.02)',
        },
        gallery: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        gap: '10px',
        marginTop: '10px',
        },
        galleryImg: {
        width: '100%',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'border-color 0.3s, transform 0.3s',
        border: '2px solid transparent',
        },
        galleryImgActive: {
        border: '2px solid #007185',
        transform: 'scale(1.05)',
        },
        videoContainer: {
        width: '100%',
        height: '500px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        videoSlide: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        },
        // Nuevos estilos para modal de zoom
        modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        },
        modalContent: {
        position: 'relative',
        maxWidth: '90%',
        maxHeight: '90%',
        width: 'auto',
        height: 'auto',
        },
        modalImage: {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        borderRadius: '8px',
        },
        modalVideo: {
        maxWidth: '100%',
        maxHeight: '100%',
        borderRadius: '8px',
        },
        closeBtn: {
        position: 'absolute',
        top: '-15px',
        right: '-15px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        border: 'none',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '1.5em',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.3s',
        zIndex: 1001,
        },
        closeBtnHover: {
        background: 'rgba(255, 0, 0, 0.8)',
        },
        productInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '0',
        },
        productName: {
        fontSize: '1.8em',
        fontWeight: '600',
        color: '#0f1111',
        margin: '0 0 10px 0',
        lineHeight: '1.3',
        },
        productPrice: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px',
        },
        priceRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        },
        priceValue: {
        fontSize: '2.2em',
        color: '#B12704',
        fontWeight: 'bold',
        },
        originalPrice: {
        fontSize: '1.2em',
        color: '#999',
        textDecoration: 'line-through',
        },
        qtyInput: {
        width: '70px',
        padding: '10px',
        border: '1px solid #a6a6a6',
        borderRadius: '4px',
        textAlign: 'center',
        fontSize: '1em',
        },
        addCartBtn: {
        background: 'linear-gradient(135deg, #ffd814, #f7ca00)',
        color: '#111',
        border: '1px solid #a88734',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: '500',
        transition: 'background 0.3s, box-shadow 0.3s',
        width: '100%',
        marginTop: '10px',
        },
        addCartBtnHover: {
        background: 'linear-gradient(135deg, #fabd03, #f0b800)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
        productStock: {
        fontSize: '1em',
        color: '#007185',
        fontWeight: '500',
        },
        productCategory: {
        fontSize: '1em',
        color: '#555',
        marginBottom: '15px',
        },
        productDetailsH3: {
        color: '#0f1111',
        fontSize: '1.2em',
        fontWeight: '600',
        margin: '20px 0 10px 0',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '5px',
        },
        productDetailsP: {
        lineHeight: '1.6',
        color: '#333',
        fontSize: '1em',
        },
        quotationSection: {
        background: '#f7f7f7',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        },
        quotationForm: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        },
        quotationInput: {
        flex: 1,
        padding: '10px',
        border: '1px solid #a6a6a6',
        borderRadius: '4px',
        },
        quotationBtn: {
        background: '#146eb4',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
        },
        listSection: {
        background: '#f7f7f7',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        },
        listForm: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        },
        listSelect: {
        flex: 1,
        padding: '10px',
        border: '1px solid #a6a6a6',
        borderRadius: '4px',
        },
        listBtn: {
        background: '#146eb4',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
        },
        commentsSection: {
        marginTop: '40px',
        },
        commentsSectionH2: {
        textAlign: 'left',
        color: '#0f1111',
        marginBottom: '30px',
        fontSize: '1.8em',
        fontWeight: '600',
        },
        addCommentForm: {
        background: '#f7f7f7',
        padding: '25px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #e0e0e0',
        },
        commentForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        },
        commentTextarea: {
        padding: '12px',
        border: '1px solid #a6a6a6',
        borderRadius: '6px',
        resize: 'vertical',
        fontFamily: 'inherit',
        fontSize: '1em',
        lineHeight: '1.5',
        },
        ratingRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        },
        ratingSelect: {
        padding: '8px',
        border: '1px solid #a6a6a6',
        borderRadius: '4px',
        },
        commentBtn: {
        background: '#146eb4',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
        alignSelf: 'flex-start',
        },
        commentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        },
        commentItem: {
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: '1px solid #e0e0e0',
        },
        commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        },
        commentRating: {
        color: '#B12704',
        fontWeight: 'bold',
        },
        commentText: {
        lineHeight: '1.6',
        color: '#333',
        marginBottom: '10px',
        },
        commentDate: {
        color: '#999',
        fontSize: '0.9em',
        },
        noComments: {
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
        padding: '40px',
        background: '#f7f7f7',
        borderRadius: '8px',
        },
        message: {
        padding: '12px',
        borderRadius: '6px',
        textAlign: 'center',
        margin: '20px 0',
        fontWeight: '500',
        },
        messageSuccess: {
        background: '#c6f6d5',
        color: '#065f46',
        border: '1px solid #9ae6b4',
        },
        messageError: {
        background: 'fed7d7',
        color: '#991b1b',
        border: '1px solid #fca5a5',
        },
        loading: {
        textAlign: 'center',
        fontSize: '1.2em',
        padding: '60px',
        color: '#555',
        },
        notFound: {
        textAlign: 'center',
        fontSize: '1.2em',
        padding: '60px',
        color: '#999',
        },
    };

    useEffect(() => {
        const fetchData = async () => {
        try {
            // Fetch product details
            const productRes = await api.get(`/auth/product/${id}`);
            if (productRes.data.success) {
            setProduct(productRes.data.product);
            }

            // Fetch comments
            const commentsRes = await api.get(`/auth/comments/${id}`);
            if (commentsRes.data.success) {
            setComments(commentsRes.data.comments);
            }

            // Fetch user lists (if logged)
            const token = localStorage.getItem('token');
            if (token) {
            const listsRes = await api.get('/auth/lists');
            if (listsRes.data.success) {
                setLists(listsRes.data.lists);
            }
            }
        } catch (err) {
            console.error('Error fetching product detail:', err);
            setMessage('Error al cargar producto');
        } finally {
            setLoading(false);
        }
        };

        fetchData();
    }, [id]);

    const handleAddToList = async (e) => {
        e.preventDefault();
        const listId = e.target.list_id.value;
        if (!listId) {
        setMessage('Selecciona una lista');
        return;
        }

        try {
        const res = await api.post('/auth/add_to_list', { list_id: listId, product_id: id });
        if (res.data.success) {
            setMessage(res.data.message);
        } else {
            setMessage(res.data.message);
        }
        } catch (err) {
        setMessage('Error al agregar a lista');
        }
    };

    const handleQuotationRequest = async (e) => {
        e.preventDefault();
        if (!proposedPrice) {
        setMessage('Ingresa un precio');
        return;
        }

        try {
        const res = await api.post('/auth/quotation_request', { product_id: id, new_price: proposedPrice });
        if (res.data.success) {
            setMessage(res.data.message);
            setProposedPrice('');
        }
        } catch (err) {
        setMessage('Error al solicitar cotización');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
        setMessage('Comentario vacío');
        return;
        }
        if (rating < 1 || rating > 5) {
        setMessage('Rating inválido');
        return;
        }

        try {
        const res = await api.post('/auth/comment', { product_id: id, text: newComment, rating });
        if (res.data.success) {
            setMessage(res.data.message);
            setNewComment('');
            setRating(5);
            // Refresh comments
            const commentsRes = await api.get(`/auth/comments/${id}`);
            if (commentsRes.data.success) {
            setComments(commentsRes.data.comments);
            }
        }
        } catch (err) {
        setMessage('Error al agregar comentario');
        }
    };

    // Función para agregar al carrito (adaptada de Home.js y Shop.js: con alert, dispatch event, y qty del input)
    const handleAddToCart = async (qty = 1) => {
        const token = localStorage.getItem('token');
        if (!token) {
        alert('Inicia sesión para agregar al carrito');
        return;
        }

        try {
        const res = await api.post('/auth/cart/add', {
            pid: id,
            name: product.name,
            price: product.price,
            image: product.image_01,
            qty,  // Usa el qty del input
        });
        if (res.data.success) {
            alert(`¡Agregado! ${product.name} x${qty}`);
            console.log('Item agregado, cartCount:', res.data.cartCount);  // Debug como en home/shop
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: res.data.cartCount || 0 } }));
            setCartQty(1);  // Reset qty
        } else {
            alert(res.data.message || 'Error al agregar al carrito');
        }
        } catch (err) {
        console.error('Error adding to cart:', err);
        alert('Error al agregar al carrito');
        }
    };

    // Preparar imágenes para galería simple
    const images = [
        { src: `/uploaded_img/${product?.image_01}`, type: 'image', alt: product?.name },
        ...(product?.image_02 ? [{ src: `/uploaded_img/${product.image_02}`, type: 'image', alt: 'Imagen 2' }] : []),
        ...(product?.image_03 ? [{ src: `/uploaded_img/${product.image_03}`, type: 'image', alt: 'Imagen 3' }] : []),
    ];
    const video = product?.video ? `/uploaded_videos/${product.video}` : null;

    // Función para abrir modal de zoom (solo para imágenes, video no por simplicidad)
    const openModal = (index) => {
        if (images[index]?.type === 'image') {
        setSelectedImage(index);
        setModalOpen(true);
        }
    };

    // Cerrar modal
    const closeModal = () => {
        setModalOpen(false);
    };

    // Cerrar modal al click en overlay
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
        closeModal();
        }
    };

    if (loading) return <div style={styles.loading}>Cargando producto...</div>;
    if (!product) return <div style={styles.notFound}>Producto no encontrado</div>;

    return (
        <div style={styles.productDetailContainer}>
        <div style={styles.productHeader}>
            <h1 style={styles.productTitle}>Vista Previa: {product.name}</h1>
        </div>

        <div style={styles.productMain}>
            <div style={styles.productImages}>
            {/* Imagen principal */}
            {video ? (
                <div style={styles.videoContainer}>
                <video src={video} controls style={styles.videoSlide}>
                    Tu navegador no soporta video.
                </video>
                </div>
            ) : (
                <div style={styles.mainImageContainer}>
                <img 
                    src={images[selectedImage]?.src} 
                    alt={images[selectedImage]?.alt} 
                    style={styles.mainImage}
                    onClick={() => openModal(selectedImage)}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
                </div>
            )}

            {/* Galería de thumbnails en grid */}
            {images.length > 0 && (
                <div style={styles.gallery}>
                {images.map((img, index) => (
                    <img 
                    key={index} 
                    src={img.src} 
                    alt={img.alt || `Imagen ${index + 1}`}
                    style={{
                        ...styles.galleryImg,
                        ...(index === selectedImage ? styles.galleryImgActive : {}),
                    }}
                    onClick={() => {
                        setSelectedImage(index);
                        openModal(index);
                    }}
                    />
                ))}
                </div>
            )}
            </div>

            <div style={styles.productInfo}>
            <h2 style={styles.productName}>{product.name}</h2>
            <div style={styles.productPrice}>
                <div style={styles.priceRow}>
                <span style={styles.priceValue}>{product.price} MXN</span>
                {/* Opcional: precio original si existe */}
                {product.original_price && <span style={styles.originalPrice}>{product.original_price} MXN</span>}
                <input 
                    type="number" 
                    min="1" 
                    max="99" 
                    value={cartQty}
                    onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setCartQty(Math.min(Math.max(val, 1), 99));
                    }}
                    style={styles.qtyInput}
                    placeholder="Qty"
                />
                </div>
                <button 
                style={styles.addCartBtn} 
                onClick={() => handleAddToCart(cartQty)}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #fabd03, #f0b800)'}
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #ffd814, #f7ca00)'}
                >
                Agregar al Carrito
                </button>
            </div>
            <div style={styles.productStock}>
                <span>En stock: </span>
                <span>{product.quantity} unidades</span>
            </div>
            <div style={styles.productCategory}>
                Categoría: <span>{product.category_name || 'Sin categoría'}</span>
            </div>
            <div>
                <h3 style={styles.productDetailsH3}>Descripción</h3>
                <p style={styles.productDetailsP}>{product.details}</p>
            </div>

            {/* Cotización */}
            <div style={styles.quotationSection}>
                <h3 style={styles.productDetailsH3}>Solicitar Cotización</h3>
                <form onSubmit={handleQuotationRequest} style={styles.quotationForm}>
                <input 
                    type="number" 
                    placeholder="Precio propuesto" 
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    min="0" step="0.01" required
                    style={styles.quotationInput}
                />
                <button type="submit" style={styles.quotationBtn}>Solicitar</button>
                </form>
            </div>

            {/* Lista */}
            {lists.length > 0 && (
                <div style={styles.listSection}>
                <h3 style={styles.productDetailsH3}>Agregar a Lista</h3>
                <form onSubmit={handleAddToList} style={styles.listForm}>
                    <select name="list_id" required style={styles.listSelect}>
                    <option value="">Seleccionar lista</option>
                    {lists.map(list => (
                        <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                    </select>
                    <button type="submit" style={styles.listBtn}>Agregar</button>
                </form>
                </div>
            )}
            </div>
        </div>

        {/* Comentarios */}
        <div style={styles.commentsSection}>
            <h2 style={styles.commentsSectionH2}>Reseñas y Comentarios</h2>
            <div style={styles.addCommentForm}>
            <form onSubmit={handleAddComment} style={styles.commentForm}>
                <textarea 
                placeholder="Escribe tu comentario..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={styles.commentTextarea}
                rows="4"
                />
                <div style={styles.ratingRow}>
                <label style={{ fontWeight: '500' }}>Rating:</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} style={styles.ratingSelect}>
                    {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} estrellas</option>)}
                </select>
                <button type="submit" style={styles.commentBtn}>Enviar Comentario</button>
                </div>
            </form>
            </div>

            <div style={styles.commentsList}>
            {comments.length > 0 ? (
                comments.map(comment => (
                <div key={comment.id} style={styles.commentItem}>
                    <div style={styles.commentHeader}>
                    <strong>{comment.name}</strong>
                    <span style={styles.commentRating}>★ {comment.rating}/5</span>
                    </div>
                    <p style={styles.commentText}>{comment.text}</p>
                    <span style={styles.commentDate}>{new Date(comment.created_at).toLocaleDateString('es-MX')}</span>
                </div>
                ))
            ) : (
                <p style={styles.noComments}>No hay comentarios todavía. ¡Sé el primero!</p>
            )}
            </div>
        </div>

        {message && (
            <div style={{
            ...styles.message,
            ...(message.includes('Error') ? styles.messageError : styles.messageSuccess),
            }}>
            {message}
            </div>
        )}

        {/* Modal de Zoom para Imágenes */}
        {modalOpen && images[selectedImage] && (
            <div style={styles.modalOverlay} onClick={handleOverlayClick}>
            <div style={styles.modalContent}>
                <img 
                src={images[selectedImage].src} 
                alt={images[selectedImage].alt} 
                style={styles.modalImage}
                />
                <button 
                style={styles.closeBtn} 
                onClick={closeModal}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.8)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.8)'}
                >
                ×
                </button>
            </div>
            </div>
        )}
        </div>
    );
    };

    export default ProductDetail;