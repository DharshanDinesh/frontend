/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import './Home.css';
import axios from "axios";
import { List, Input, Button, Row, Col, Select, Typography, Modal, Card, Space, Form, Spin, Tag, Empty, Tree } from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  TeamOutlined,
  BankOutlined,
  DollarOutlined,
  HomeOutlined,
  AppstoreOutlined
} from "@ant-design/icons";

export const Home = () => {
  const [isRoomsUpdated, refreshRooms] = useState(false);
  const { Title } = Typography;
  
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Business Settings</Title>
      <Row gutter={[24, 24]} justify="start">
        <Col xs={24} lg={12}>
          <SupportDataCenterCRUD params="source" title="Partner" icon={<TeamOutlined />} />
        </Col>
        <Col xs={24} lg={12}>
          <SupportDataCenterCRUD params="account" title="Bank Accounts" icon={<BankOutlined />} />
        </Col>
        <Col xs={24} lg={12}>
          <SupportDataCenterCRUD params="currency" title="Currency" icon={<DollarOutlined />} />
        </Col>
        <Col xs={24} lg={12}>
          <HotelAndRoomsManager />
        </Col>
      </Row>
    </div>
  );
};

export const SupportDataCenterCRUD = ({
  params = "",
  title,
  icon,
  isRoomsUpdated = false,
  refreshRoom = () => {},
}) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [newCommission, setNewCommission] = useState("");
  const [select, setSelect] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdd, setIsLoadingAdd] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    title === "Rooms" && fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoomsUpdated]);

  const fetchTodos = async () => {
    setIsLoading(true);
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/${params}`
    );
    setIsLoading(false);
    setTodos(response.data);
  };

  const addTodo = async () => {
    setIsLoadingAdd(true);
    if (title === "Rooms") {
      addRooms();
    } else {
      if (!newTodo) return;
      const payload = {
        name: newTodo,
        ...(title === "Partner" && newCommission ? { commission: parseFloat(newCommission) } : {})
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/${params}`,
        payload
      );
      setTodos([...todos, response.data]);
      setNewTodo("");
      if (title === "Partner") setNewCommission("");
      setIsLoadingAdd(false);

      title === "Stay" && refreshRoom((prev) => !prev);
    }
  };

  const addRooms = async () => {
    if (!newTodo) return;
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/${params}/${select}`,
      {
        room: { name: newTodo },
      }
    );
    setTodos(response.data);
    setNewTodo("");
    setSelect(null);
    setIsLoadingAdd(false);
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/${params}/${id}`);
    setTodos(todos.filter((todo) => todo._id !== id));
    title === "Stay" && refreshRoom((prev) => !prev);
  };

  const deleteRooms = async (hotelId, roomId) => {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/${params}/${hotelId}/rooms/${roomId}`
    );

    setTodos((prev) => {
      const updatedHotelDetails = prev.map((hotel) => ({
        ...hotel,
        rooms:
          hotel._id === hotelId
            ? hotel.rooms.filter((item) => item._id !== roomId)
            : hotel.rooms,
      }));
      return updatedHotelDetails;
    });
  };

  const renameTodo = async (id, text, commission = null) => {
    const payload = {
      name: text,
      ...(commission !== null && { commission: parseFloat(commission) })
    };
    const { data } = await axios.put(
      `${import.meta.env.VITE_API_URL}/${params}/${id}`,
      payload
    );
    setTodos(data);
  };
  const renameRoom = async (hotelId, roomId, renamedText) => {
    const { data } = await axios.put(
      `${import.meta.env.VITE_API_URL}/${params}/${hotelId}/rooms/${roomId}`,
      {
        name: renamedText,
      }
    );
    setTodos(data);
  };

  const showModal = () => {
    setIsModalVisible(true);
    // Focus input after modal animation completes
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewTodo("");
    setNewCommission("");
    setSelect(null);
  };

  const handleAdd = () => {
    addTodo();
    handleCancel();
  };

  return (
    <Card
      title={
        <div className="card-header">
          <div className="header-title">
            <Space size={[8, 0]}>
              {icon}
              <span>{`${title} Details`}</span>
            </Space>
          </div>
          <div className="header-actions">
            <Button 
              type="default"
              className="add-button"
              icon={<PlusOutlined />} 
              onClick={showModal}
            >
              Add
            </Button>
          </div>
        </div>
      }
      bordered={false}
      className="dashboard-card"
    >
      <Modal
        title={`Add New ${title}`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button 
            key="cancel" 
            onClick={handleCancel}
            type="default"
            ghost
            className="modal-button secondary"
          >
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="default"
            ghost
            loading={isLoadingAdd} 
            onClick={handleAdd}
            disabled={!newTodo.trim() || (title === "Rooms" && !select)}
            className="modal-button primary"
          >
            Add {title}
          </Button>
        ]}
        className="common-modal"
      >
        <Form layout="vertical" className="modal-form">
          {title === "Rooms" && (
            <Form.Item 
              label="Select Stay"
              required
              validateStatus={select ? "success" : "error"}
              help={!select && "Please select a stay"}
            >
              <Select
                placeholder="Please select a stay"
                onChange={(val) => setSelect(val)}
                value={select}
                options={[...todos].sort((a, b) => a.name.localeCompare(b.name)).map((d) => ({ label: d.name, value: d._id }))}
                className="modal-select"
              />
            </Form.Item>
          )}
          <Form.Item 
            label={`${title} Name`}
            required
            validateStatus={newTodo.trim() ? "success" : "error"}
            help={!newTodo.trim() && "Name is required"}
          >
            <Input
              ref={inputRef}
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder={`Enter ${title.toLowerCase()} name`}
              maxLength={100}
              autoComplete="off"
            />
          </Form.Item>
          {title === "Partner" && (
            <Form.Item 
              label="Commission Percentage"
              extra="Enter the commission percentage for this partner (0-100)"
            >
              <Input
                type="number"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
                placeholder="Enter commission percentage"
                suffix="%"
                min={0}
                max={100}
                step={0.1}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {title !== "Rooms" && (
            <List
              dataSource={[...todos].sort((a, b) => a.name.localeCompare(b.name))}
              renderItem={(item) => (
                <TodoItem
                  key={item.id}
                  todo={item}
                  onEdit={renameTodo}
                  onDelete={deleteTodo}
                />
              )}
              style={{
                maxHeight: "400px",
                overflowY: "auto",
              }}
            />
          )}
        </>
      )}
    </Card>
  );
};

const TodoItem = ({ todo, onEdit, onDelete, type, hotel }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newText, setNewText] = useState(todo.name);
  const [newCommission, setNewCommission] = useState(todo.commission || "");
  const { Text } = Typography;
  const editInputRef = useRef(null);

  const showEditModal = () => {
    setNewText(todo.name);
    setNewCommission(todo.commission || "");
    setIsEditModalVisible(true);
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 100);
  };

  const handleCancel = () => {
    setIsEditModalVisible(false);
    setNewText(todo.name);
    setNewCommission(todo.commission || "");
  };

  const handleSave = () => {
    if (!newText.trim()) return;
    
    if (type === "rooms") {
      onEdit(hotel._id, todo._id, newText.trim());
    } else if (todo.commission !== undefined) {
      onEdit(todo._id, newText.trim(), newCommission);
    } else {
      onEdit(todo._id, newText.trim());
    }
    setIsEditModalVisible(false);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: `Delete ${type === "rooms" ? "Room" : todo.name}`,
      content: "Are you sure you want to delete this item? This action cannot be undone.",
      okText: "Delete",
      okButtonProps: {
        danger: true,
        className: "modal-button primary",
      },
      cancelButtonProps: {
        className: "modal-button secondary",
      },
      onOk: () => {
        type === "rooms" ? onDelete(hotel._id, todo._id) : onDelete(todo._id);
      },
    });
  };

  return (
    <>
      <List.Item className="common-list-item">
        <div className="list-item-content">
          <div className="item-main-content">
            <div className="item-info">
              <Text 
                strong 
                className="item-title"
                ellipsis={{ tooltip: todo.name }}
              >
                {todo.name}
              </Text>
              {todo.commission !== undefined && (
                <Tag 
                  className="commission-tag"
                  color={todo.commission > 0 ? 'blue' : 'default'}
                >
                  {todo.commission}% commission
                </Tag>
              )}
            </div>
          </div>
          <div className="list-actions">
            <Button 
              type="default"
              ghost
              icon={<EditOutlined />} 
              onClick={showEditModal}
              className="list-action-button edit-button"
            >
              Edit
            </Button>
            <Button 
              type="default"
              ghost
              icon={<DeleteOutlined />} 
              onClick={handleDelete}
              className="list-action-button delete-button"
            >
              Delete
            </Button>
          </div>
        </div>
      </List.Item>

      <Modal
        title={`Edit ${type === "rooms" ? "Room" : todo.name}`}
        open={isEditModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button 
            key="cancel" 
            onClick={handleCancel}
            type="default"
            ghost
            className="modal-button secondary"
          >
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="default"
            ghost
            onClick={handleSave}
            disabled={!newText.trim()}
            className="modal-button primary"
          >
            Save Changes
          </Button>
        ]}
        className="common-modal"
      >
        <Form
          layout="vertical"
          className="modal-form"
        >
          <Form.Item 
            label={`${type === "rooms" ? "Room" : todo.name} Name`}
            required
            validateStatus={newText.trim() ? "success" : "error"}
            help={!newText.trim() && "Name is required"}
          >
            <Input
              ref={editInputRef}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={`Enter ${type === "rooms" ? "room" : todo.name.toLowerCase()} name`}
              maxLength={100}
              autoComplete="off"
            />
          </Form.Item>
          {todo.commission !== undefined && (
            <Form.Item 
              label="Commission Percentage"
              extra="Enter the commission percentage for this partner (0-100)"
            >
              <Input
                type="number"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
                placeholder="Enter commission percentage"
                suffix="%"
                min={0}
                max={100}
                step={0.1}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

const HotelAndRoomsManager = () => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('hotel'); // 'hotel' or 'room'
  const [modalAction, setModalAction] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({ name: '' });
  const [expandedKeys, setExpandedKeys] = useState([]);
  const treeRef = useRef(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/hotel`);
      const hotelsData = response.data;
      setHotels(hotelsData);
      // Don't expand hotels by default
      setExpandedKeys([]);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
    setIsLoading(false);
  };

  const inputRef = useRef(null);

  const showModal = (mode, action, hotel = null, room = null) => {
    setModalMode(mode);
    setModalAction(action);
    setSelectedHotel(hotel);
    setFormData({
      name: action === 'edit' ? (mode === 'hotel' ? hotel?.name : room?.name) : ''
    });
    setIsModalVisible(true);
    // Focus input after modal animation completes
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFormData({ name: '' });
    setSelectedHotel(null);
  };

  const scrollToItem = (key) => {
    setTimeout(() => {
      const element = document.querySelector(`[data-key="${key}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      if (modalMode === 'hotel') {
        if (modalAction === 'add') {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/hotel`, {
            name: formData.name.trim()
          });
          // Update hotels list
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/hotel`);
          setHotels(response.data);
          // Keep expanded keys unchanged and scroll to the new hotel
          setTimeout(() => scrollToItem(data._id), 100);
        } else {
          const { data } = await axios.put(
            `${import.meta.env.VITE_API_URL}/hotel/${selectedHotel._id}`,
            { name: formData.name.trim() }
          );
          setHotels(prevHotels => 
            prevHotels.map(h => h._id === selectedHotel._id ? data : h)
          );
        }
      } else {
        if (modalAction === 'add') {
          const { data } = await axios.put(
            `${import.meta.env.VITE_API_URL}/hotel/${selectedHotel._id}`,
            { room: { name: formData.name.trim() } }
          );
          
          // Fetch fresh data to ensure we have the latest room information
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/hotel`);
          const updatedHotels = response.data;
          
          // Find the updated hotel and its new room
          const updatedHotel = updatedHotels.find(h => h._id === selectedHotel._id);
          const newRoom = updatedHotel.rooms[updatedHotel.rooms.length - 1];

          // Update state with fresh data
          setHotels(updatedHotels);
          
          // Only expand the hotel that has the new room
          setExpandedKeys([selectedHotel._id]);
          
          // Scroll to the new room after a short delay to ensure rendering
          setTimeout(() => scrollToItem(newRoom._id), 100);
        } else {
          const { data } = await axios.put(
            `${import.meta.env.VITE_API_URL}/hotel/${selectedHotel._id}/rooms/${formData.roomId}`,
            { name: formData.name.trim() }
          );
          setHotels(prevHotels => 
            prevHotels.map(h => h._id === selectedHotel._id ? data : h)
          );
        }
      }
      handleCancel();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (hotel, room = null) => {
    try {
      if (!room) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/hotel/${hotel._id}`);
        setHotels(hotels.filter(h => h._id !== hotel._id));
      } else {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/hotel/${hotel._id}/rooms/${room._id}`
        );
        setHotels(hotels.map(h => {
          if (h._id === hotel._id) {
            return {
              ...h,
              rooms: h.rooms.filter(r => r._id !== room._id)
            };
          }
          return h;
        }));
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const confirmDelete = (hotel, room = null) => {
    Modal.confirm({
      title: `Delete ${room ? 'Room' : 'Stay'}`,
      content: `Are you sure you want to delete this ${room ? 'room' : 'stay'}${!room ? ' and all its rooms' : ''}? This action cannot be undone.`,
      okText: "Delete",
      okButtonProps: {
        danger: true,
        className: "modal-button delete"
      },
      cancelButtonProps: {
        className: "modal-button secondary"
      },
      onOk: () => handleDelete(hotel, room)
    });
  };

  return (
    <Card
      title={
        <div className="card-header">
          <div className="header-title">
            <Space size={[8, 0]}>
              <HomeOutlined />
              <span>Stays & Rooms</span>
            </Space>
          </div>
          <div className="header-actions">
            <Button
              type="default"
              className="add-button"
              icon={<PlusOutlined />}
              onClick={() => showModal('hotel', 'add')}
            >
              Add Stay
            </Button>
          </div>
        </div>
      }
      bordered={false}
      className="dashboard-card"
    >
      <Modal
        title={`${modalAction === 'add' ? 'Add' : 'Edit'} ${modalMode === 'hotel' ? 'Stay' : 'Room'}`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            type="default"
            ghost
            className="modal-button secondary"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="default"
            ghost
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="modal-button primary"
          >
            {modalAction === 'add' ? 'Add' : 'Save Changes'}
          </Button>
        ]}
        className="common-modal"
      >
        <Form layout="vertical" className="modal-form">
          <Form.Item
            label={`${modalMode === 'hotel' ? 'Stay' : 'Room'} Name`}
            required
            validateStatus={formData.name.trim() ? "success" : "error"}
            help={!formData.name.trim() && "Name is required"}
          >
            <Input
              ref={inputRef}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={`Enter ${modalMode === 'hotel' ? 'stay' : 'room'} name`}
              maxLength={100}
              autoComplete="off"
            />
          </Form.Item>
        </Form>
      </Modal>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
          {hotels.length === 0 ? (
            <Empty description="No stays found. Add your first stay to get started." />
          ) : (
            <Tree
              ref={treeRef}
              showLine={{ showLeafIcon: false }}
              className="rooms-tree"
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys)}
              treeData={[...hotels].sort((a, b) => a.name.localeCompare(b.name)).map(hotel => ({
                key: hotel._id,
                title: (
                  <div className="common-list-item" data-key={hotel._id}>
                    <div className="list-item-content">
                      <div className="item-main-content">
                        <div className="item-info">
                          <HomeOutlined className="item-icon" />
                          <Typography.Text
                            strong
                            className="item-title"
                            ellipsis={{ tooltip: hotel.name }}
                          >
                            {hotel.name}
                          </Typography.Text>
                        </div>
                      </div>
                      <div className="list-actions">
                        <Button
                          type="default"
                          ghost
                          icon={<PlusOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            showModal('room', 'add', hotel);
                          }}
                          className="list-action-button add-button"
                        >
                          Add Room
                        </Button>
                        <Button
                          type="default"
                          ghost
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            showModal('hotel', 'edit', hotel);
                          }}
                          className="list-action-button edit-button"
                        >
                          Edit
                        </Button>
                        <Button
                          type="default"
                          ghost
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(hotel);
                          }}
                          className="list-action-button delete-button"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ),
                children: (hotel.rooms || []).sort((a, b) => a.name.localeCompare(b.name)).map(room => ({
                  key: room._id,
                  title: (
                    <div className="common-list-item" data-key={room._id}>
                      <div className="list-item-content">
                        <div className="item-main-content">
                          <div className="item-info">
                            <AppstoreOutlined className="item-icon" />
                            <Typography.Text
                              className="item-title"
                              ellipsis={{ tooltip: room.name }}
                            >
                              {room.name}
                            </Typography.Text>
                          </div>
                        </div>
                        <div className="list-actions">
                          <Button
                            type="default"
                            ghost
                            icon={<EditOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              showModal('room', 'edit', hotel, room);
                            }}
                            className="list-action-button edit-button"
                          >
                            Edit
                          </Button>
                          <Button
                            type="default"
                            ghost
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(hotel, room);
                            }}
                            className="list-action-button delete-button"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                }))
              }))}
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default TodoItem;
